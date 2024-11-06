use crate::v2::app_states::AppState;
use crate::v2::consts::dir_names::WXX_DATA_DIR_NAME;
use crate::v2::errors::app_cmd_error::{AppCmdError, AppCmdResult};
use crate::v2::models::process::{LcuProcessInfo, LcuProcessStatus};
use std::path::PathBuf;
use tauri::{AppHandle, Manager, Runtime, State};

pub async fn need_lcu_process_info(state: &State<'_, AppState>) -> AppCmdResult<LcuProcessInfo> {
    let status = { state.process_status.read().await.clone() };

    match status {
        LcuProcessStatus::Started(info) => Ok(info),
        _ => Err(AppCmdError::LcuProcessNotStarted),
    }
}

pub fn need_app_data_dir<R: Runtime>(app_handle: &AppHandle<R>) -> PathBuf {
    app_handle
        .path()
        .data_dir()
        .unwrap()
        .join(WXX_DATA_DIR_NAME)
}
