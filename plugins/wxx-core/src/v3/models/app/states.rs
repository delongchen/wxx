use crate::v3::errors::{AppInternalError, LcuProcessError};
use crate::v3::models::{
    lcu::process_status::{LcuProcessInfo, LcuProcessStatus},
    lcu::rest_client::LcuRestClient,
};
use tauri::async_runtime::RwLock;

pub struct AppState {
    pub lcu_process: RwLock<LcuProcessStatus>,
    pub rest_client: LcuRestClient,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            lcu_process: RwLock::new(LcuProcessStatus::NotStarted),
            rest_client: LcuRestClient::new(),
        }
    }
}

impl AppState {
    pub async fn read_lcu_process(&self) -> LcuProcessStatus {
        self.lcu_process.read().await.clone()
    }

    pub async fn need_lcu_process_info(&self) -> Result<LcuProcessInfo, AppInternalError> {
        if let LcuProcessStatus::Started(info) = self.read_lcu_process().await {
            Ok(info)
        } else {
            Err(AppInternalError::LcuProcessError(
                LcuProcessError::NotStarted,
            ))
        }
    }
}
