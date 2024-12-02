use crate::v3::errors::{AppInternalError, DatabaseQueryError};
use crate::v3::models::db::{WxxDB, WxxSqlite};
use prost::Message;
use sqlx::{FromRow, Sqlite};
use std::collections::HashSet;
use wxx_protobuf::lcu::match_history::Game;

const H_MS: i64 = 60 * 60 * 1000;
pub const MAX_SAFE_EXCEPTED_GAME_COUNT: u32 = 200;
pub const GOOD_EXCEPTED_GAME_COUNT: u32 = 10;

#[derive(FromRow)]
pub struct GameWithCreation {
    pub game_id: i64,
    pub creation: i64,
}

pub struct GameEntry(i64, Vec<String>, Vec<u8>);

impl GameEntry {
    pub fn from_game(game: &Game) -> Self {
        let mut puuid_list = Vec::new();
        for id in game.participant_identities.iter() {
            let player = id.player.as_ref().unwrap();
            puuid_list.push(player.puuid.to_string());
        }

        let mut body: Vec<u8> = Vec::new();
        game.encode(&mut body).unwrap();
        Self(game.game_id as i64, puuid_list, body)
    }
}

fn get_since_the_epoch_ms() -> i64 {
    let now = std::time::SystemTime::now();
    let since_the_epoch_ms = now
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;
    
    since_the_epoch_ms
}

pub fn select_excepted_game_count(last_sync_time_ms: i64) -> u32 {
    if last_sync_time_ms <= 0 {
        return MAX_SAFE_EXCEPTED_GAME_COUNT;
    }

    let since_last_sync_ms = get_since_the_epoch_ms() - last_sync_time_ms;
    let since_last_sync_h = (since_last_sync_ms / H_MS) as u32;

    match since_last_sync_h {
        0..GOOD_EXCEPTED_GAME_COUNT => GOOD_EXCEPTED_GAME_COUNT,
        GOOD_EXCEPTED_GAME_COUNT..MAX_SAFE_EXCEPTED_GAME_COUNT => since_last_sync_h,
        _ => MAX_SAFE_EXCEPTED_GAME_COUNT,
    }
}

pub trait LcuDbTools: WxxDB {
    async fn read_cached_games(&self, puuid: &str) -> Result<(i64, HashSet<i64>), AppInternalError> {
        let sql = sqlx::query_as::<Sqlite, GameWithCreation>(
            "
        SELECT gs.game_id, gc.creation
        FROM game_summoners gs
        JOIN game_creations gc
        ON gs.game_id = gc.game_id
        WHERE gs.puuid = $1",
        )
        .bind(puuid);
        let cached_games = self.fetch(sql).await?;
        let mut id_set = HashSet::<i64>::new();

        if cached_games.len() == 0 {
            Ok((0, id_set))
        } else {
            let mut latest_creation = 0;
            for game in cached_games {
                if game.creation > latest_creation {
                    latest_creation = game.creation;
                }

                id_set.insert(game.game_id);
            }
            Ok((latest_creation, id_set))
        }
    }

    async fn read_latest_sync_time(&self, puuid: &str) -> Result<i64, AppInternalError> {
        let sql = sqlx::query_scalar("SELECT time FROM latest_sync WHERE puuid = $1")
            .bind(puuid);

        let result = self.scalar::<i64>(sql).await?;

        Ok(result.unwrap_or_default())
    }

    async fn insert_games(&self, puuid: &str, games: Vec<GameEntry>) -> Result<(), AppInternalError> {
        let mut tran = self.transaction().await?;
        
        for game in games {
            sqlx::query("INSERT INTO games (id, body) VALUES ($1, $2)")
                .bind(game.0)
                .bind(&game.2)
                .execute(&mut *tran)
                .await
                .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;
            
            for player in game.1 {
                sqlx::query("INSERT INTO OR IGNORE game_summoners (game_id, puuid) VALUES ($1, $2)")
                    .bind(game.0)
                    .bind(player)
                    .execute(&mut *tran)
                    .await
                    .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;
            }
        }
        
        sqlx::query("INSERT INTO latest_sync (puuid, time) VALUES ($1, $2)")
            .bind(puuid)
            .bind(get_since_the_epoch_ms())
            .execute(&mut *tran)
            .await
            .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;
        
        tran.commit().await.map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;
        
        Ok(())
    }
}

impl LcuDbTools for WxxSqlite {}
