use crate::v3::errors::DatabaseQueryError;
use sqlx::{
    query::{Query, QueryAs, QueryScalar},
    sqlite::{SqliteArguments, SqliteQueryResult, SqliteRow},
    FromRow, Sqlite, SqlitePool, Transaction,
};
use std::path::Path;

type QueryType<'q> = Query<'q, Sqlite, SqliteArguments<'q>>;

pub struct WxxSqlite(SqlitePool);
impl WxxSqlite {
    fn new(pool: SqlitePool) -> Self {
        Self(pool)
    }

    pub async fn open_pool(dir_path: &Path, db_name: &str) -> sqlx::Result<Self> {
        let db_file_path = dir_path.join(db_name);

        let pool = SqlitePool::connect(&format!("sqlite:{}", db_file_path.display())).await?;

        Ok(WxxSqlite::new(pool))
    }
}

pub trait WxxDB {
    async fn fetch<'q, T>(
        &self,
        query: QueryAs<'q, Sqlite, T, SqliteArguments<'q>>,
    ) -> Result<Vec<T>, DatabaseQueryError>
    where
        T: Send + Unpin + for<'r> FromRow<'r, SqliteRow>;

    async fn execute<'q>(
        &self,
        query: QueryType<'q>,
    ) -> Result<SqliteQueryResult, DatabaseQueryError>;

    async fn scalar<'q, T>(
        &self,
        query: QueryScalar<'q, Sqlite, T, SqliteArguments<'q>>,
    ) -> Result<Option<T>, DatabaseQueryError>
    where
        T: Send + Unpin,
        (T,): Send + Unpin + for<'r> FromRow<'r, SqliteRow>;

    async fn transaction(&self) -> Result<Transaction<Sqlite>, DatabaseQueryError>;
}

impl WxxDB for WxxSqlite {
    async fn fetch<'q, T>(
        &self,
        query: QueryAs<'q, Sqlite, T, SqliteArguments<'q>>,
    ) -> Result<Vec<T>, DatabaseQueryError>
    where
        T: Send + Unpin + for<'r> FromRow<'r, SqliteRow>,
    {
        let rows = query
            .fetch_all(&self.0)
            .await
            .map_err(|e| DatabaseQueryError::FetchError(e.to_string()))?;

        Ok(rows)
    }

    async fn execute<'q>(
        &self,
        query: QueryType<'q>,
    ) -> Result<SqliteQueryResult, DatabaseQueryError> {
        let result = query
            .execute(&self.0)
            .await
            .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;

        Ok(result)
    }

    async fn scalar<'q, T>(
        &self,
        query: QueryScalar<'q, Sqlite, T, SqliteArguments<'q>>,
    ) -> Result<Option<T>, DatabaseQueryError>
    where
        T: Send + Unpin,
        (T,): Send + Unpin + for<'r> FromRow<'r, SqliteRow>,
    {
        let result = query
            .fetch_optional(&self.0)
            .await
            .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?;

        Ok(result)
    }

    async fn transaction(&self) -> Result<Transaction<Sqlite>, DatabaseQueryError> {
        Ok(self
            .0
            .begin()
            .await
            .map_err(|e| DatabaseQueryError::ExecuteError(e.to_string()))?)
    }
}
