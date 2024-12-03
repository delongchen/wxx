use crate::v3::errors::{AppInternalError, DatabaseQueryError};
use crate::v3::models::db::{WxxDB, WxxSqlite};
use sqlx::Sqlite;
use std::collections::HashSet;
use wxx_protobuf::lcu::match_history::Game;

use super::models::{GameEntry, GameWithCreation};
use super::utils::get_since_the_epoch_ms;

pub trait LcuDbHelper: WxxDB {
    async fn read_cached_games(
        &self,
        puuid: &str,
    ) -> Result<(i64, HashSet<i64>), AppInternalError> {
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
        let sql = sqlx::query_scalar("SELECT time FROM latest_sync WHERE puuid = $1").bind(puuid);

        let result = self.scalar::<i64>(sql).await?;

        Ok(result.unwrap_or_default())
    }

    async fn get_cached_game_info(
        &self,
        puuid: &str,
    ) -> Result<(i64, HashSet<i64>, i64), AppInternalError> {
        let (latest_game_creation, cached_game_id_set) = self.read_cached_games(&puuid).await?;
        let last_sync_time_ms = self.read_latest_sync_time(&puuid).await?;

        Ok((latest_game_creation, cached_game_id_set, last_sync_time_ms))
    }

    async fn record_latest_sync_time(&self, puuid: &str) -> Result<(), AppInternalError> {
        let sql = sqlx::query("INSERT OR REPLACE INTO latest_sync (puuid, time) VALUES ($1, $2)")
            .bind(puuid)
            .bind(get_since_the_epoch_ms());

        self.execute(sql).await?;

        Ok(())
    }

    async fn insert_games(&self, details: &Vec<Game>) -> Result<(), AppInternalError> {
        let mut tran = self.transaction().await?;

        for game_detail in details {
            let game = GameEntry::from_game(game_detail);

            sqlx::query("INSERT INTO games (id, body) VALUES ($1, $2)")
                .bind(game.0)
                .bind(&game.2)
                .execute(&mut *tran)
                .await
                .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;

            for player in game.1 {
                sqlx::query("INSERT INTO game_summoners (game_id, puuid) VALUES ($1, $2)")
                    .bind(game.0)
                    .bind(player)
                    .execute(&mut *tran)
                    .await
                    .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;
            }
        }

        tran.commit()
            .await
            .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;

        Ok(())
    }
}

impl LcuDbHelper for WxxSqlite {}
