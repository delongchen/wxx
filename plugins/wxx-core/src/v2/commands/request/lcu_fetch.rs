use crate::v2::app_states::AppState;
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use serde_json::Value;
use tauri::{command, State};

#[command]
pub async fn lcu_fetch(
    state: State<'_, AppState>,
    method: String,
    endpoint: String,
    body: Value,
    timeout: u64,
) -> Result<Value, LcuFetchError> {
    let fetcher = state
        .get_fetcher()
        .await
        .ok_or(LcuFetchError::LcuNotStarted)?;
    
    let response = fetcher
        .fetch::<Value>(&method, endpoint, timeout, &body)
        .await?;

    Ok(response)
}
