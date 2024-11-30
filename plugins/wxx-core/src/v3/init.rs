use crate::consts::get_user_dir_path_map;
use crate::v3::models::db::WxxDB;
use std::io;
use tauri::async_runtime::JoinHandle;
use tauri::{AppHandle, Manager, Runtime};

async fn pre_create_dirs(data_dir_path: &std::path::Path) -> io::Result<()> {
    for node in get_user_dir_path_map() {
        node.create_if_not_exist(data_dir_path)?;
    }

    Ok(())
}

async fn init_sqlite(data_dir_path: &std::path::Path) -> sqlx::Result<WxxDB> {
    let db_dir = data_dir_path.join("wxsb").join("db");

    let db = WxxDB::open_pool(&db_dir, "data.db").await?;

    db.create_table("games", &["ID INT PRIMARY KEY"]).await?;

    Ok(db)
}

pub fn init_plugin<R: Runtime>(app_handle: &AppHandle<R>) -> JoinHandle<io::Result<()>> {
    let app_handle = app_handle.clone();

    let handle = tauri::async_runtime::spawn(async move {
        let data_dir_path = app_handle.path().data_dir().unwrap();

        pre_create_dirs(&data_dir_path).await?;

        let sqlite_pool = init_sqlite(&data_dir_path).await.map_err(|err| {
            io::Error::new(io::ErrorKind::Other, format!("sqlite init error: {}", err))
        })?;

        app_handle.manage(sqlite_pool);

        Ok::<(), io::Error>(())
    });

    handle
}
