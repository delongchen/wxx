use tauri::async_runtime::Mutex;
use crate::v2::models::process::LcuProcessStatus;

pub struct AppState {
    pub process_status: Mutex<LcuProcessStatus>,
}

impl AppState {
    pub fn empty() -> Self {
        Self {
            process_status: Mutex::new(LcuProcessStatus::NotStarted),
        }
    }
}
