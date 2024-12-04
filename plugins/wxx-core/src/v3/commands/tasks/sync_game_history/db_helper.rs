use crate::v3::errors::{AppInternalError, DatabaseQueryError};
use crate::v3::models::db::{WxxDB, WxxSqlite};
use sqlx::Sqlite;
use std::collections::HashSet;
use wxx_protobuf::lcu::match_history::Game;

use super::models::{GameRecord, GameWithCreation, TaskContext};
use super::utils::get_since_the_epoch_ms;

pub trait LcuDbHelper: WxxDB {
    async fn query_games_by_puuid(&self, puuid: &str) -> Result<Vec<GameRecord>, AppInternalError> {
        let sql = sqlx::query_as::<Sqlite, GameRecord>(
            "
SELECT game_summoners.game_id, games.creation, games.body
FROM game_summoners
JOIN games
ON game_summoners.game_id = games.game_id
WHERE game_summoners.puuid = $1
            ",
        )
        .bind(puuid);

        let result = self.fetch(sql).await?;

        Ok(result)
    }

    async fn query_game_creation_by_puuid(
        &self,
        puuid: &str,
    ) -> Result<(i64, HashSet<i64>), AppInternalError> {
        let sql = sqlx::query_as::<Sqlite, GameWithCreation>(
            "
        SELECT game_summoners.game_id, games.creation
        FROM game_summoners
        JOIN games
        ON game_summoners.game_id = games.game_id
        WHERE game_summoners.puuid = $1",
        )
        .bind(puuid);
        let cached_games = self.fetch(sql).await?;
        let mut id_set = HashSet::<i64>::new();

        if cached_games.len() == 0 {
            return Ok((0, id_set));
        }

        let mut latest_creation = 0;

        for game in cached_games {
            if game.creation > latest_creation {
                latest_creation = game.creation;
            }

            id_set.insert(game.game_id);
        }

        Ok((latest_creation, id_set))
    }

    async fn query_latest_sync_time(&self, puuid: &str) -> Result<i64, AppInternalError> {
        let sql = sqlx::query_scalar("SELECT time FROM latest_sync WHERE puuid = $1").bind(puuid);

        let result = self.scalar::<i64>(sql).await?;

        Ok(result.unwrap_or_default())
    }

    async fn new_task_ctx_from_cache(
        &self,
        puuid: &str,
    ) -> Result<TaskContext, AppInternalError> {
        let (latest_game_creation, cached_game_id_set) =
            self.query_game_creation_by_puuid(&puuid).await?;
        
        let last_sync_time_ms = self.query_latest_sync_time(&puuid).await?;
        
        let full_update = last_sync_time_ms == 0;
        
        let ctx = TaskContext::new(
            puuid.to_string(),
            full_update,
            latest_game_creation,
            cached_game_id_set,
            last_sync_time_ms,
        );

        Ok(ctx)
    }

    async fn insert_latest_sync_time(&self, puuid: &str) -> Result<(), AppInternalError> {
        let sql = sqlx::query("INSERT OR REPLACE INTO latest_sync (puuid, time) VALUES ($1, $2)")
            .bind(puuid)
            .bind(get_since_the_epoch_ms());

        self.execute(sql).await?;

        Ok(())
    }

    async fn insert_games(&self, details: &Vec<Game>) -> Result<(), AppInternalError> {
        let mut tran = self.transaction().await?;

        for game_detail in details {
            let record = GameRecord::from_game(game_detail);
            let id_list = &game_detail.participant_identities;

            sqlx::query(
                "INSERT OR IGNORE INTO games (game_id, creation, body) VALUES ($1, $2, $3)",
            )
            .bind(record.game_id)
            .bind(record.creation)
            .bind(&record.body)
            .execute(&mut *tran)
            .await
            .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;

            for id in id_list {
                let player = id.player.as_ref().unwrap();

                sqlx::query(
                    "INSERT OR IGNORE INTO game_summoners (game_id, puuid) VALUES ($1, $2)",
                )
                .bind(record.game_id)
                .bind(&player.puuid)
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
