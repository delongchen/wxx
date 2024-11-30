use sqlx::SqlitePool;
use std::path::Path;

pub struct WxxDB(SqlitePool);

impl WxxDB {
    pub async fn open_pool(dir_path: &Path, db_name: &str) -> Result<Self, sqlx::Error> {
        let db_file_path = dir_path.join(db_name);

        let pool = SqlitePool::connect(
            &format!("sqlite:{}", db_file_path.display())
        ).await?;
        
        Ok(WxxDB(pool))
    }
    
    pub async fn create_table_if_not_exists(&self) -> Result<(), sqlx::Error> {
        sqlx::query(r#"
CREATE TABLE IF NOT EXISTS a (
    
)"#).execute(&self.0).await?;
        
        Ok(())
    }
}
