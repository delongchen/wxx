use serde_json::Value;

use tauri::{command, State};

use super::utils::store::LcuManager;

#[command]
pub async fn handle_get_request(
    state: State<'_, LcuManager>,
    endpoint: String,
) -> Result<Value, String> {
    let read_guard = state.0.read().await;
    read_guard.send_get_request(endpoint).await
}

#[command]
pub async fn handle_post_request(
    state: State<'_, LcuManager>,
    endpoint: String,
    body: Value,
) -> Result<Value, String> {
    let read_guard = &state.0.read().await;
    read_guard.send_post_request(endpoint, body).await
}
