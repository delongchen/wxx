use serde_json::Value;
use shaco::rest::RESTClient;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Default)]
pub struct Lcu {
    pub is_started: bool,
    pub rest_client: Option<RESTClient>,
}

impl Lcu {
    pub async fn send_get_request(&self, endpoint: String) -> Result<Value, String> {
        if let Some(client) = &self.rest_client {
            client
                .get(endpoint)
                .await
                .map_err(|e| format!("Failed to send request: {}", e))
        } else {
            Err("LCU Client not initialized".to_string())
        }
    }

    pub async fn send_post_request(&self, endpoint: String, body: Value) -> Result<Value, String> {
        if let Some(client) = &self.rest_client {
            client
                .post(endpoint, body)
                .await
                .map_err(|e| format!("Failed to send request: {}", e))
        } else {
            Err("LCU Client not initialized".to_string())
        }
    }
}

#[derive(Default)]
pub struct LcuManager(pub Arc<RwLock<Lcu>>);
