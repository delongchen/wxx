use std::path::PathBuf;
use tauri::{AppHandle, Manager, Runtime};
use crate::v2::consts::dir_names::{CONFIG_DIR_NAME, SUMMONER_DATA_DIR_NAME, WXX_DATA_DIR_NAME};
use crate::v2::utils::create_dir_if_not_exists_sync;

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

pub fn preload<R: Runtime>(app: &AppHandle<R>) {
    prepare_data_dirs(
        app.path().data_dir().unwrap().join(WXX_DATA_DIR_NAME),
        vec![CONFIG_DIR_NAME, SUMMONER_DATA_DIR_NAME],
    )
}
