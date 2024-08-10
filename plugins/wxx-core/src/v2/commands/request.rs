use crate::v2::app_states::AppState;
use crate::v2::models::process::LcuProcessStatus;
use reqwest::RequestBuilder;
use serde::{Serialize, Serializer};
use serde_json::Value;
use tauri::{command, State};

pub enum LcuFetchError {
    LcuNotStarted,
    CreateRequestError,
    SendRequestError(String),
    ResponseParseError,
}

#[derive(Serialize)]
struct LcuFetchErrorWrapper {
    code: u8,
    message: String,
}

impl LcuFetchError {
    fn wrap(&self) -> LcuFetchErrorWrapper {
        match self {
            LcuFetchError::LcuNotStarted => LcuFetchErrorWrapper {
                code: 0,
                message: "lcu not started".to_string(),
            },
            LcuFetchError::CreateRequestError => LcuFetchErrorWrapper {
                code: 1,
                message: "create request error".to_string(),
            },
            LcuFetchError::SendRequestError(message) => LcuFetchErrorWrapper {
                code: 2,
                message: message.to_string(),
            },
            LcuFetchError::ResponseParseError => LcuFetchErrorWrapper {
                code: 3,
                message: "parsing response error".to_string(),
            },
        }
    }
}

impl serde::Serialize for LcuFetchError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.wrap().serialize(serializer)
    }
}

#[command]
pub async fn lcu_fetch(
    state: State<'_, AppState>,
    method: String,
    endpoint: String,
    body: Value,
) -> Result<Value, LcuFetchError> {
    let process_status = {
        let status = state.process_status.lock().await.clone();
        if let LcuProcessStatus::Started(info) = status {
            info
        } else {
            return Err(LcuFetchError::LcuNotStarted);
        }
    };

    let client = &state.rest_client;

    let req = client.create_request(
        method,
        endpoint,
        body,
        process_status.port,
        process_status.auth_token,
    );

    let req = match req {
        Ok(req) => req,
        Err(_) => return Err(LcuFetchError::CreateRequestError),
    };

    let response = send_request(req).await?;

    Ok(response)
}

async fn send_request(req: RequestBuilder) -> Result<Value, LcuFetchError> {
    let res = match req.send().await {
        Ok(res) => res,
        Err(e) => return Err(LcuFetchError::SendRequestError(e.to_string())),
    };

    if let Ok(v) = res.json::<Value>().await {
        Ok(v)
    } else {
        Err(LcuFetchError::ResponseParseError)
    }
}
