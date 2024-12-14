use crate::v3::errors::{AppInternalError, DatabaseQueryError};
use crate::v3::models::db::{WxxDB, WxxSqlite};
use prost::Message;
use sqlx::query::Query;
use sqlx::sqlite::SqliteArguments;
use sqlx::{Sqlite, Transaction};
use std::collections::HashSet;
use wxx_protobuf::lcu::match_history::Game;
use wxx_protobuf::lcu::summoner::SummonerBaseInfo;

use crate::v3::commands::tasks::models::{
    GameRecord, GameWithCreation, SummonerRecord, TaskContext,
};
use crate::v3::utils::get_since_the_epoch_ms;

trait TranHelper: Sized {
    async fn execute_by_self<'q>(
        self,
        query: Query<'q, Sqlite, SqliteArguments<'q>>,
    ) -> Result<Self, DatabaseQueryError>;
}

impl<'e> TranHelper for Transaction<'e, Sqlite> {
    async fn execute_by_self<'q>(
        mut self,
        query: Query<'q, Sqlite, SqliteArguments<'q>>,
    ) -> Result<Self, DatabaseQueryError> {
        query
            .execute(&mut *self)
            .await
            .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;

        Ok(self)
    }
}

pub trait LcuDbHelper: WxxDB {
    async fn query_games_by_puuid(&self, puuid: &str) -> Result<Vec<GameRecord>, AppInternalError> {
        let sql = sqlx::query_as::<Sqlite, GameRecord>(
            "
SELECT game_players.game_id, games.creation, games.version, games.body
FROM game_players
JOIN games
ON game_players.game_id = games.game_id
WHERE game_players.puuid = $1
            ",
        )
        .bind(puuid);

        let result = self.fetch(sql).await?;

        Ok(result)
    }

    async fn fetch_summoners(
        &self,
        full_updated: bool,
    ) -> Result<Vec<SummonerRecord>, AppInternalError> {
        let mut sql = String::from("SELECT * FROM summoners");

        if full_updated {
            sql.push_str(" WHERE latest_sync != 0");
        }

        let result = self.fetch(sqlx::query_as(&sql)).await?;

        Ok(result)
    }

    async fn delete_summoner(&self, puuid: &str) -> Result<(), AppInternalError> {
        self.execute(sqlx::query("DELETE FROM summoners WHERE puuid = $1").bind(puuid))
            .await?;

        Ok(())
    }

    async fn query_game_creation_by_puuid(
        &self,
        puuid: &str,
    ) -> Result<(i64, HashSet<i64>), AppInternalError> {
        let sql = sqlx::query_as::<Sqlite, GameWithCreation>(
            "
        SELECT games.game_id, games.creation
        FROM games
        JOIN game_players
        ON game_players.game_id = games.game_id
        WHERE game_players.puuid = $1",
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

    async fn insert_summoner(&self, summoner: SummonerBaseInfo) -> Result<(), AppInternalError> {
        let mut buf: Vec<u8> = Vec::new();
        summoner.encode(&mut buf).unwrap();

        let sql = sqlx::query(
            "
INSERT INTO summoners (puuid, latest_sync, body) VALUES ($1, $2, $3)
ON CONFLICT(puuid) DO UPDATE SET
body = excluded.body
            ",
        )
        .bind(&summoner.puuid)
        .bind(0)
        .bind(&buf);

        self.execute(sql).await?;

        Ok(())
    }

    async fn query_latest_sync_time(&self, puuid: &str) -> Result<i64, AppInternalError> {
        let sql =
            sqlx::query_scalar("SELECT latest_sync FROM summoners WHERE puuid = $1").bind(puuid);

        let result = self.scalar::<i64>(sql).await?;

        Ok(result.unwrap_or_default())
    }

    async fn new_task_ctx_from_cache(&self, puuid: &str) -> Result<TaskContext, AppInternalError> {
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
        let sql = sqlx::query("UPDATE summoners SET latest_sync = $1 WHERE puuid = $2")
            .bind(get_since_the_epoch_ms())
            .bind(puuid);

        self.execute(sql).await?;

        Ok(())
    }

    async fn insert_games(&self, details: &Vec<Game>) -> Result<(), AppInternalError> {
        let mut tx = self.transaction().await?;

        for game_detail in details {
            let record = GameRecord::from_game(game_detail);
            let id_list = &game_detail.participant_identities;

            tx = tx
                .execute_by_self(
                    sqlx::query(
                        "INSERT OR IGNORE INTO
                        games (game_id, creation, version, body) 
                        VALUES ($1, $2, $3, $4)",
                    )
                    .bind(record.game_id)
                    .bind(record.creation)
                    .bind(record.version)
                    .bind(&record.body),
                )
                .await?;

            for id in id_list {
                let player = id.player.as_ref().unwrap();

                tx = tx
                    .execute_by_self(
                        sqlx::query("INSERT OR IGNORE INTO players (puuid) VALUES ($1)")
                            .bind(&player.puuid),
                    )
                    .await?
                    .execute_by_self(
                        sqlx::query(
                            "INSERT OR IGNORE INTO game_players (game_id, puuid) VALUES ($1, $2)",
                        )
                        .bind(record.game_id)
                        .bind(&player.puuid),
                    )
                    .await?;
            }
        }

        tx.commit()
            .await
            .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;

        Ok(())
    }
}

impl LcuDbHelper for WxxSqlite {}
