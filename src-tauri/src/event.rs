use futures_util::stream::StreamExt;

use serde_json::Value;
use shaco::{model::ws::LcuEvent, model::ws::LcuSubscriptionType, ws};

use tauri::{App, Manager};

#[derive(Clone, serde::Serialize)]
struct Payload {
    subscription_type: String,
    data: Value,
    event_type: String,
}

pub async fn notify_client_event(app: App) -> Result<(), Box<dyn std::error::Error>> {
    let mut client = ws::LcuWebsocketClient::connect()
        .await
        .map_err(|e| format!("Failed to create websocket client: {}", e))?;
    client
        .subscribe(LcuSubscriptionType::JsonApiEvent(
            "/lol-gameflow/v1/gameflow-phase".to_string(),
        ))
        .await
        .unwrap();
    while let Some(event) = client.next().await {
        println!("Event: {:?}", event);
        app.emit_all(
            "lcu_event",
            Payload {
                subscription_type: event.subscription_type.to_string(),
                data: event.data,
                event_type: event.event_type,

            },
        )
        .unwrap();
    }
    Ok(())
}
