use crate::consts::events::LCU_WS_EVENT;
use crate::consts::RIOT_GAMES_PEM_BYTES;
use crate::v3::errors::LcuWSError;
use crate::v3::models::lcu::lcu_event_stream::LcuEventStream;
use crate::v3::models::lcu::process_status::LcuProcessInfo;
use futures_util::{SinkExt, StreamExt};
use tauri::async_runtime::JoinHandle;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::mpsc;
use tokio_tungstenite::{
    connect_async_tls_with_config, tungstenite, tungstenite::client::IntoClientRequest, Connector,
};

async fn connect_ws_to_lcu(lcu_process_info: LcuProcessInfo) -> Result<LcuEventStream, LcuWSError> {
    let certificate = native_tls::Certificate::from_pem(RIOT_GAMES_PEM_BYTES)
        .map_err(|_| LcuWSError::BuildCertificateFailed)?;

    let connector = native_tls::TlsConnector::builder()
        .add_root_certificate(certificate)
        .build()
        .map_err(|_| LcuWSError::BuildCertificateFailed)?;

    let mut connect_request = format!("wss://127.0.0.1:{}", &lcu_process_info.api_port)
        .into_client_request()
        .map_err(|_| LcuWSError::BuildConnectRequestFailed)?;

    connect_request.headers_mut().insert(
        "Authorization",
        tungstenite::http::HeaderValue::from_str(
            format!("Basic {}", &lcu_process_info.auth_token).as_str(),
        )
        .map_err(|_| LcuWSError::BuildConnectRequestFailed)?,
    );

    let (mut stream, _) = connect_async_tls_with_config(
        connect_request,
        None,
        false,
        Some(Connector::NativeTls(connector)),
    )
    .await
    .map_err(|_| LcuWSError::ConnectFailed)?;

    stream
        .send(tungstenite::Message::Text(String::from(
            "[5, \"OnJsonApiEvent\"]",
        )))
        .await
        .map_err(|err| LcuWSError::SendMessageFailed(err))?;

    Ok(LcuEventStream(stream))
}

pub fn spawn_lcu_events_listener<R: Runtime>(
    app_handle: &AppHandle<R>,
    process_info_receiver: mpsc::Receiver<LcuProcessInfo>,
) -> JoinHandle<()> {
    let app_handle = app_handle.clone();

    let handle = tauri::async_runtime::spawn(async move {
        let mut receiver = process_info_receiver;

        while let Some(lcu_process_info) = receiver.recv().await {
            if let Ok(mut event_stream) = connect_ws_to_lcu(lcu_process_info).await {
                while let Some(event_text) = event_stream.next().await {
                    if let Err(_) = app_handle.emit(LCU_WS_EVENT, event_text) {}
                }
            }
        }
    });

    handle
}
