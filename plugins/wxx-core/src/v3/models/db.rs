use sqlx::SqlitePool;
use std::path::PathBuf;

pub struct WxxDB(SqlitePool);

impl WxxDB {
    pub async fn open_or_init(dir_path: &PathBuf, db_name: &str) -> Result<Self, sqlx::Error> {
        let db_path = dir_path.join(db_name);

        if let Some(parent_dir) = db_path.parent() {
            tokio::fs::create_dir_all(parent_dir).await?;
        }

        println!("Creating database: {}", db_path.display());

        let pool = SqlitePool::connect(&format!("sqlite:{}", db_path.display())).await?;

        sqlx::query(
            "CREATE TABLE IF NOT EXISTS my_table (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    value TEXT NOT NULL
                )",
        )
        .execute(&pool)
        .await?;

        Ok(WxxDB(pool))
    }
}
