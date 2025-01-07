use crate::v3::errors::CommandError;
use crate::v3::models::app::states::AppState;
use crate::v3::utils::LcuFetcher;
use tauri::State;

#[tauri::command]
pub async fn lcu_fetch(
    state: State<'_, AppState>,
    method: String,
    endpoint: String,
    body: serde_json::Value,
    timeout: u64,
    retry_attempts: u32,
) -> Result<tauri::ipc::Response, CommandError> {
    match state
        .lcu_fetch_with_retry(&method, &endpoint, &body, timeout, retry_attempts)
        .await?
        .bytes()
        .await
    {
        Ok(bytes) => Ok(tauri::ipc::Response::new(bytes.to_vec())),
        Err(e) => Err(CommandError::EncodeResultFailed(e.to_string())),
    }
}
