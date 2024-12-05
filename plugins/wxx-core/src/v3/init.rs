use std::io;
use tauri::async_runtime::JoinHandle;
use tauri::{AppHandle, Manager, Runtime};

mod ensure_app_data_dir;
mod init_sqlite;

pub fn init_plugin<R: Runtime>(app_handle: &AppHandle<R>) -> JoinHandle<io::Result<()>> {
    let app_handle = app_handle.clone();

    let handle = tauri::async_runtime::spawn(async move {
        let data_dir_path = app_handle.path().data_dir().unwrap();

        ensure_app_data_dir::ensure(&data_dir_path).await?;
        init_sqlite::init(&app_handle)
            .await
            .inspect_err(|err| {
                println!("init_sqlite: error: {:?}", err);
            })?;

        Ok::<(), io::Error>(())
    });

    handle
}
