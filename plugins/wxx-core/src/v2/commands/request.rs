use crate::v2::app_states::AppState;
use crate::v2::models::process::LcuProcessStatus;
use reqwest::RequestBuilder;
use serde_json::Value;
use tauri::{command, State};

async fn send_request(req: RequestBuilder) -> Result<Value, String> {
    let res = match req.send().await {
        Ok(res) => res,
        Err(e) => return Err(e.to_string()),
    };

    if let Ok(v) = res.json::<Value>().await {
        println!("req ok: {:?}", v);
        Ok(v)
    } else {
        Err("".to_string())
    }
}

#[command]
pub async fn lcu_fetch(
    state: State<'_, AppState>,
    method: String,
    endpoint: String,
) -> Result<Value, String> {
    println!("{}: {}", method, endpoint);

    let process_status = {
        let status = state.process_status.lock().await.clone();
        println!("{:?}", status);
        if let LcuProcessStatus::Started(info) = status {
            info
        } else {
            return Err("lcu not start".to_string());
        }
    };

    let client = &state.rest_client;

    let req = client
        .create_request(
            method,
            endpoint,
            process_status.port,
            process_status.auth_token,
        )
        .map_err(|_| "".to_string())?;

    send_request(req).await
}
