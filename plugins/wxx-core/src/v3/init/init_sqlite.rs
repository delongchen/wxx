use crate::v3::errors::DatabaseQueryError;
use crate::v3::models::db::{WxxDB, WxxSqlite};
use serde_json::Value;
use sqlx::sqlite::SqliteQueryResult;
use std::io;
use tauri::{AppHandle, Manager, Runtime};

struct TableDefinition(String, Vec<String>);

fn parse_tables(value: &Value) -> Option<TableDefinition> {
    match value {
        Value::Array(entry) => {
            if let (Value::String(table_name), Value::Array(lines)) = (&entry[0], &entry[1]) {
                Some(TableDefinition(
                    table_name.to_string(),
                    lines
                        .iter()
                        .filter_map(|line| line.as_str().map(|s| s.to_string()))
                        .collect(),
                ))
            } else {
                None
            }
        }
        _ => None,
    }
}

fn get_tables() -> Vec<TableDefinition> {
    if let Value::Array(root) =
        serde_json::from_str(include_str!("../../config/sqlite_tables.json")).unwrap()
    {
        root.iter().filter_map(parse_tables).collect()
    } else {
        Vec::new()
    }
}

trait CreateTableHelper
where
    Self: WxxDB,
{
    async fn try_create_table(
        &self,
        name: String,
        props: Vec<String>,
    ) -> Result<SqliteQueryResult, DatabaseQueryError> {
        let sql = format!("CREATE TABLE IF NOT EXISTS {} ({})", name, props.join(","));

        self.execute(sqlx::query(&sql)).await
    }
}

impl CreateTableHelper for WxxSqlite {}

pub async fn init<R: Runtime>(app_handle: &AppHandle<R>) -> io::Result<()> {
    let db_file_path = app_handle
        .path()
        .data_dir()
        .unwrap()
        .join("wxsb")
        .join("db");

    let pool = WxxSqlite::open_pool(&db_file_path, "wxsb.db")
        .await
        .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;

    for table in get_tables() {
        pool.try_create_table(table.0, table.1)
            .await
            .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
    }

    app_handle.manage(pool);

    Ok(())
}
