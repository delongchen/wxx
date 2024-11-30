use sqlx::{
    query::Query,
    sqlite::{SqliteArguments, SqliteQueryResult, SqliteRow},
    Sqlite, SqlitePool,
};
use std::path::Path;

type QueryType<'q> = Query<'q, Sqlite, SqliteArguments<'q>>;

pub struct WxxDB(SqlitePool);

impl WxxDB {
    pub fn new(pool: SqlitePool) -> Self {
        Self(pool)
    }

    pub async fn open_pool(dir_path: &Path, db_name: &str) -> sqlx::Result<Self> {
        let db_file_path = dir_path.join(db_name);

        let pool = SqlitePool::connect(&format!("sqlite:{}", db_file_path.display())).await?;

        Ok(WxxDB::new(pool))
    }

    pub async fn fetch<'q>(&self, query: QueryType<'q>) -> sqlx::Result<Vec<SqliteRow>> {
        let rows = query.fetch_all(&self.0).await?;
        Ok(rows)
    }

    pub async fn execute<'q>(
        &self,
        query: QueryType<'q>,
    ) -> sqlx::Result<SqliteQueryResult> {
        let result = query.execute(&self.0).await?;
        Ok(result)
    }
}

impl WxxDB {
    pub async fn create_table(
        &self,
        name: &str,
        props: &[&str],
    ) -> sqlx::Result<SqliteQueryResult> {
        let sql = format!(
            "CREATE TABLE IF NOT EXISTS {} ({})",
            name,
            props.join(", "),
        );
        
        Ok(self.execute(sqlx::query(&sql)).await?)
    }
}
