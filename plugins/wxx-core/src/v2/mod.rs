use tauri::{AppHandle, Manager, Runtime};

pub mod consts;
pub mod models;
pub mod commands;
pub mod process_watcher;
pub mod app_states;
pub mod ws_client;
pub mod config_manager;
mod utils;

pub fn create_app_dir<R: Runtime>(app: &AppHandle<R>, targets: Vec<&str>) {
    if let Ok(data_dir) = app.path().data_dir() {
        for target in targets {
            let mut target_path = data_dir.clone();
            target_path.push(target);
            if let Err(e) = utils::create_dir_if_not_exists(&target_path) {
                println!("create {} failed: {:?}", target_path.display(), e);
            }
        }
    }
}
