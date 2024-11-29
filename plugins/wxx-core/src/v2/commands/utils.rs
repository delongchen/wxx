use crate::consts::dir_names::WXX_DATA_DIR_NAME;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, Runtime};

pub fn need_app_data_dir<R: Runtime>(app_handle: &AppHandle<R>) -> PathBuf {
    app_handle
        .path()
        .data_dir()
        .unwrap()
        .join(WXX_DATA_DIR_NAME)
}
