use crate::v2::models::process::LcuProcessStatus;
use crate::v2::models::rest::LcuRestClient;
use tauri::async_runtime::RwLock;

pub struct AppState {
    pub process_status: RwLock<LcuProcessStatus>,
    pub rest_client: LcuRestClient,
}

impl AppState {
    pub fn empty() -> Self {
        Self {
            process_status: RwLock::new(LcuProcessStatus::NotStarted),
            rest_client: LcuRestClient::new(),
        }
    }
}
