use crate::v2::app_states::AppState;
use crate::v2::commands::utils::need_lcu_process_info;
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use crate::v2::models::rest::LcuFetcher;
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
    let process_info = need_lcu_process_info(&state)
        .await
        .map_err(|_| LcuFetchError::LcuNotStarted)?;

    let fetcher = LcuFetcher::of(
        &state.rest_client,
        &process_info.port,
        &process_info.auth_token,
    );

    let response = fetcher
        .fetch::<Value>(&method, endpoint, timeout, &body)
        .await?;

    Ok(response)
}
