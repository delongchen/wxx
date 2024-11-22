use crate::v2::models::process::{LcuProcessInfo, LcuProcessStatus};
use crate::v2::models::rest::{LcuFetcher, LcuRestClient};
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
    
    pub async fn need_started(&self) -> Option<LcuProcessInfo> {
        let curr_status = { self.process_status.read().await.clone() };
        
        match curr_status {
            LcuProcessStatus::Started(info) => Some(info),
            _ => None,
        }
    }
    
    pub async fn get_fetcher(&self) -> Option<LcuFetcher> {
        if let Some(info) = self.need_started().await {
            Some(LcuFetcher::from(
                &self.rest_client,
                info.port,
                info.auth_token,
            ))
        } else { None }
    }
}
