use serde_json::Value;
use shaco::rest::RESTClient;
use tauri::State;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct LolApiClient {
    client: RESTClient,
}

impl LolApiClient {
    pub fn new() -> Self {
        loop {
            match RESTClient::new() {
                Ok(client) => {
                    println!("Successfully connected to the server");
                    return Self { client };
                }
                Err(e) => {
                    println!("Failed to connect to the server: {}. Retrying in 1 second...", e);
                    std::thread::sleep(std::time::Duration::from_secs(1));
                }
            }
        }
    }

    pub async fn send_get_request(&self, endpoint: String) -> Result<Value, String> {
        self.client
            .get(endpoint)
            .await
            .map_err(|e| format!("Failed to send request: {}", e))
    }

    pub async fn send_post_request(&self, endpoint: String, body: Value) -> Result<Value, String> {
        self.client
            .post(endpoint, body)
            .await
            .map_err(|e| format!("Failed to send request: {}", e))
    }
}

#[tauri::command]
pub async fn handle_get_request(
    state: State<'_, Arc<RwLock<Option<LolApiClient>>>>,
    endpoint: String,
) -> Result<Value, String> {
    let read_guard = state.read().await;
    if let Some(client) = &*read_guard {
        client.send_get_request(endpoint).await
    } else {
        Err("Client not initialized".to_string())
    }
}

#[tauri::command]
pub async fn handle_post_request(
    state: State<'_, Arc<RwLock<Option<LolApiClient>>>>,
    endpoint: String,
    body: Value,
) -> Result<Value, String> {
    let read_guard = state.read().await;
    if let Some(client) = &*read_guard {
        client.send_post_request(endpoint, body).await
    } else {
        Err("Client not initialized".to_string())
    }
}
