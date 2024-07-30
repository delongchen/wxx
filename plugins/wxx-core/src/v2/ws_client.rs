use super::models::ws::LcuWsClient;
use crate::v2::app_states::AppState;
use crate::v2::consts::RIOT_GAMES_PEM_BYTES;
use crate::v2::models::process::LcuProcessInfo;
use crate::v2::models::process::LcuProcessStatus;
use futures_util::StreamExt;
use std::time::Duration;
use tauri::async_runtime::JoinHandle;
use tauri::{AppHandle, Manager, Runtime};
use tokio::time::sleep;

pub fn start_ws_client<R: Runtime>(app: &AppHandle<R>, timeout: u64) -> JoinHandle<()> {
    let app = app.clone();

    let handle = tauri::async_runtime::spawn(async move {
        let state = app.state::<AppState>();
        let client = LcuWsClient::from(RIOT_GAMES_PEM_BYTES);

        loop {
            let process_info: Option<LcuProcessInfo> = {
                match state.process_status.lock().await.clone() {
                    LcuProcessStatus::Started(info) => Some(info),
                    _ => None,
                }
            };

            if let Ok(mut s) = client.connect_with(process_info).await {
                while let Some(message) = s.next().await {
                    if let Err(e) = app.emit("LCU_EVENT", message) {
                        println!("emit error: {}", e);
                    }
                }
            }

            sleep(Duration::from_millis(timeout)).await;
        }
    });

    handle
}
