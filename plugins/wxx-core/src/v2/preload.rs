use crate::consts::dir_names::{CONFIG_DIR_NAME, SUMMONER_DATA_DIR_NAME, WXX_DATA_DIR_NAME};
use crate::v2::utils::create_dir_if_not_exists_sync;
use crate::v3::models::db::WxxDB;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, Runtime};

fn prepare_data_dirs(app_data_path: PathBuf, sub_dir_list: Vec<&str>) {
    let mut dirs_to_prepare: Vec<PathBuf> = Vec::new();
    for sub_dir in sub_dir_list {
        dirs_to_prepare.push(app_data_path.join(sub_dir));
    }
    dirs_to_prepare.push(app_data_path);

    for dir in dirs_to_prepare {
        if let Err(err) = create_dir_if_not_exists_sync(&dir) {
            println!("creating folder {} failed: {}", dir.display(), err);
        }
    }
}

pub fn init_db<R: Runtime>(app_handle: &AppHandle<R>, data_path: PathBuf) {
    let app_handle = app_handle.clone();

    tauri::async_runtime::spawn(async move {
        let pool = {
            match WxxDB::open_or_init(&data_path, "data.db").await {
                Ok(pool) => pool,
                Err(err) => {
                    println!("WxxDB::open_or_init failed: {}", err);

                    return Err(err);
                }
            }
        };

        app_handle.manage(pool);

        Ok::<(), sqlx::Error>(())
    });
}

pub fn preload<R: Runtime>(app: &AppHandle<R>) {
    let data_dir = app.path().data_dir().unwrap();

    prepare_data_dirs(
        data_dir.join(WXX_DATA_DIR_NAME),
        vec![CONFIG_DIR_NAME, SUMMONER_DATA_DIR_NAME, "db"],
    );

    init_db(app, data_dir.join("wxsb").join("db"));
}
