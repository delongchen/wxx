use tauri::State;
use crate::v2::app_states::AppState;
use crate::v2::errors::app_cmd_error::{AppCmdError, AppCmdResult};
use crate::v2::models::process::{LcuProcessInfo, LcuProcessStatus};

pub async fn need_lcu_process_info(state: &State<'_, AppState>) -> AppCmdResult<LcuProcessInfo> {
    let status = {
        state
            .process_status
            .read()
            .await
            .clone()
    };
    
    match status {
        LcuProcessStatus::Started(info) => Ok(info),
        _ => Err(AppCmdError::LcuProcessNotStarted),
    }
}