use super::event::{LcuEvent, Payload};
use super::process::create_lcu_proccess_state_iterator;
use super::store::LcuManager;
use futures_util::StreamExt;
use serde_json::json;
use shaco::{model::ws::LcuSubscriptionType, rest::RESTClient, ws};
use std::borrow::BorrowMut;
use tauri::{AppHandle, Manager, Runtime};

pub fn start_listen_lcu<R: Runtime>(app: AppHandle<R>) -> () {
    let state = app.state::<LcuManager>();
    let app_handle = app.clone();
    let lcu = state.0.clone();
    tauri::async_runtime::spawn(async move {
        let mut lcu_state_iter = create_lcu_proccess_state_iterator();
        while let Some(current_state_is_started) = lcu_state_iter.next() {
            let mut read_guard = lcu.write().await;
            let pre_state_is_started = lcu.read().await.is_started;
            if current_state_is_started != pre_state_is_started {
                let _ = app_handle.emit(
                    LcuEvent::LcuStateChange.as_str(),
                    Payload {
                        key: None,
                        data: json!({
                            "is_started": current_state_is_started
                        }),
                    },
                );
                read_guard.is_started = current_state_is_started;
            }

            if current_state_is_started && !pre_state_is_started {
                if let Err(err) = connect_lcu_ws(app_handle.clone()).await {
                    let _ = app_handle.clone().emit(
                        LcuEvent::Log.as_str(),
                        Payload {
                            key: None,
                            data: json!({"type":"error", "msg": err}),
                        },
                    );
                    return;
                };
                match connect_lcu_rest().await {
                    Ok(client) => read_guard.rest_client = Some(client),
                    Err(err) => {
                        let _ = app_handle.clone().emit(
                            LcuEvent::Log.as_str(),
                            Payload {
                                key: None,
                                data: json!({"type":"error", "msg": err}),
                            },
                        );
                    }
                }
            }
        }
    });
    ()
}

async fn connect_lcu_ws<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let app_handle = app.clone();
    match ws::LcuWebsocketClient::connect().await {
        Ok(mut client) => {
            if let Err(e) = client
                .subscribe(LcuSubscriptionType::AllJsonApiEvents)
                .await
            {
                return Err(format!("Failed to subscribe  LCU websocket: {}", e));
            }

            tauri::async_runtime::spawn(async move {
                while let Some(event) = client.borrow_mut().next().await {
                    let _ = app_handle.emit(
                        LcuEvent::LcuWsJsonApi.as_str(),
                        Payload {
                            key: Some(event.event_type),
                            data: event.data,
                        },
                    );
                }
            });
            Ok(())
        }
        Err(e) => Err(format!("Failed to connect lcu websocket client: {}", e)),
    }
}

async fn connect_lcu_rest() -> Result<RESTClient, String> {
    match RESTClient::new() {
        Ok(client) => return Ok(client),
        Err(e) => Err(format!("Failed to create lcu client: {}", e)),
    }
}
