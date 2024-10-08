use serde_json::Value;
use tauri::{command, State};
use crate::v2::app_states::AppState;
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use super::utils::{check_lcu_started, send_request};

#[command]
pub async fn lcu_fetch(
    state: State<'_, AppState>,
    method: String,
    endpoint: String,
    body: Value,
    timeout: u64,
) -> Result<Value, LcuFetchError> {
    let process_info = check_lcu_started(&state).await?;

    let req = state.rest_client.create_request(
        &method,
        &endpoint,
        &body,
        &process_info.port,
        &process_info.auth_token,
        timeout,
    ).map_err(|_| LcuFetchError::CreateRequestError)?;

    let res = send_request::<Value>(req).await?;

    Ok(res)
}
