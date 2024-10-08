use reqwest::RequestBuilder;
use serde::de::DeserializeOwned;
use serde_json::Value;
use tauri::State;
use crate::v2::app_states::AppState;
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use crate::v2::models::process::{LcuProcessInfo, LcuProcessStatus};

pub async fn check_lcu_started(state: &State<'_, AppState>) -> Result<LcuProcessInfo, LcuFetchError> {
    let status = state.process_status.lock().await.clone();

    if let LcuProcessStatus::Started(info) = status {
        Ok(info)
    } else {
        Err(LcuFetchError::LcuNotStarted)
    }
}


pub async fn send_request<T: DeserializeOwned>(
    req: RequestBuilder,
) -> Result<T, LcuFetchError> {
    let res = match req.send().await {
        Ok(res) => res,
        Err(e) => return Err(LcuFetchError::SendRequestError(e.to_string())),
    };

    if !res.status().is_success() {
        return  Err(LcuFetchError::RequestNotSuccess(
            res.json::<Value>().await.unwrap_or(Value::Null)
        ))
    }

    match res.json::<T>().await {
        Ok(parsed) => Ok(parsed),
        Err(e) => Err(LcuFetchError::ResponseDeserializationError(e.to_string()))
    }
}
