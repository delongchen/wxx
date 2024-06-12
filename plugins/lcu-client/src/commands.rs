use futures_util::stream::StreamExt;
use serde_json::Value;
use std::sync::Arc;

use shaco::{model::ws::LcuSubscriptionType, rest::RESTClient, ws};
use tokio::sync::RwLock;
use tokio::time::{sleep, Duration};

use tauri::{command, AppHandle, Manager, Runtime, State};

const RETRY_INTERVAL: u64 = 1;

const EVENT_NAME: &str = "lcu_event";

#[derive(Clone, serde::Serialize)]
struct Payload {
    subscription_type: String,
    data: Value,
    event_type: String,
}

#[derive(Default)]

struct LcuClient(Option<RESTClient>);

#[derive(Default)]
pub struct LcuClientManager(Arc<RwLock<LcuClient>>);

impl LcuClient {
    pub async fn send_get_request(&self, endpoint: String) -> Result<Value, String> {
        if let Some(client) = &self.0 {
            client
                .get(endpoint)
                .await
                .map_err(|e| format!("Failed to send request: {}", e))
        } else {
            Err("LCU Client not initialized".to_string())
        }
    }

    pub async fn send_post_request(&self, endpoint: String, body: Value) -> Result<Value, String> {
        if let Some(client) = &self.0 {
            client
                .post(endpoint, body)
                .await
                .map_err(|e| format!("Failed to send request: {}", e))
        } else {
            Err("LCU Client not initialized".to_string())
        }
    }
}

async fn connect_with_retry() -> Result<LcuClient, String> {
    loop {
        match RESTClient::new() {
            Ok(client) => return Ok(LcuClient(Some(client))),
            Err(e) => {
                println!(
                    "Failed to create lcu client: {}. Retrying in {} second...",
                    e, RETRY_INTERVAL
                );
                std::thread::sleep(std::time::Duration::from_secs(1));
            }
        }
    }
}

async fn connect_ws_with_retry() -> Result<ws::LcuWebsocketClient, String> {
    loop {
        match ws::LcuWebsocketClient::connect().await {
            Ok(client) => return Ok(client),
            Err(e) => {
                println!(
                    "Failed to create lcu websocket client: {}. Retrying in 1 second...",
                    e
                );
                sleep(Duration::from_secs(RETRY_INTERVAL)).await;
            }
        }
    }
}

#[command]
pub async fn handle_get_request(
    state: State<'_, LcuClientManager>,
    endpoint: String,
) -> Result<Value, String> {
    let read_guard = &state.0.read().await;
    read_guard.send_get_request(endpoint).await
}

#[command]
pub async fn handle_post_request(
    state: State<'_, LcuClientManager>,
    endpoint: String,
    body: Value,
) -> Result<Value, String> {
    let read_guard = &state.0.read().await;
    read_guard.send_post_request(endpoint, body).await
}

#[command]
pub async fn connect_lcu_client<R: Runtime>(
    app: AppHandle<R>,
    state: State<'_, LcuClientManager>,
) -> Result<(), String> {
    let lcu_client = Arc::clone(&state.0);

    tauri::async_runtime::spawn(async move {
        match connect_with_retry().await {
            Ok(client) => {
                let mut write_lock = lcu_client.write().await;
                *write_lock = client;
                let _ = app.emit(
                    EVENT_NAME,
                    Payload {
                        subscription_type: "lcu_client".to_string(),
                        data: Value::Bool(true),
                        event_type: "connect".to_string(),
                    },
                );
            }
            Err(e) => {
                eprintln!("Failed to connect to LCU client: {}", e);
            }
        };
    });

    Ok(())
}

#[command]
pub async fn start_listen_lcu_event<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let app_handle = app.clone();
    let mut ws_client = match connect_ws_with_retry().await {
        Ok(ws_client) => ws_client,
        Err(e) => {
            eprintln!("Failed to connect to LCU websocket: {}", e);
            return Err(e);
        }
    };
    if let Err(e) = ws_client
        .subscribe(LcuSubscriptionType::JsonApiEvent(
            "/lol-gameflow/v1/gameflow-phase".to_string(),
        ))
        .await
    {
        eprintln!("Failed to subscribe to LCU websocket: {}", e);
        return Err(e.to_string());
    }
    tauri::async_runtime::spawn(async move {
        while let Some(event) = ws_client.next().await {
            if let Err(e) = app_handle.emit(
                EVENT_NAME,
                Payload {
                    subscription_type: event.subscription_type.to_string(),
                    data: event.data,
                    event_type: event.event_type,
                },
            ) {
                eprintln!("Failed to emit event: {}", e);
            }
        }
    });
    Ok(())
}
