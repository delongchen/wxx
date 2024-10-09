use super::process::LcuProcessInfo;
use futures_util::{SinkExt, Stream, StreamExt};
use native_tls::{Certificate, TlsConnector};
use serde_json::Value;
use std::pin::Pin;
use std::task::{Context, Poll};
use tokio::net::TcpStream;
use tokio_tungstenite::tungstenite;
use tokio_tungstenite::tungstenite::client::IntoClientRequest;
use tokio_tungstenite::tungstenite::handshake::client::Request;
use tokio_tungstenite::tungstenite::http::HeaderValue;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::MaybeTlsStream;
use tokio_tungstenite::{Connector, WebSocketStream};

type LcuWsStreamType = WebSocketStream<MaybeTlsStream<TcpStream>>;
type LcuWsResult<T> = Result<T, LcuWsError>;
pub struct LcuWsStream(LcuWsStreamType);

impl Stream for LcuWsStream {
    type Item = Value;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        loop {
            return match self.0.poll_next_unpin(cx) {
                Poll::Pending => Poll::Pending,
                Poll::Ready(Some(Ok(Message::Text(text)))) => match serde_json::from_str(&text) {
                    Ok(Value::Array(mut arr)) => {
                        if let Some(last) = arr.pop() {
                            Poll::Ready(Some(last))
                        } else {
                            continue;
                        }
                    }
                    _ => continue,
                },
                Poll::Ready(Some(Ok(Message::Close(_))) | Some(Err(_)) | None) => Poll::Ready(None),
                _ => continue,
            };
        }
    }
}

#[derive(Debug)]
pub enum LcuWsError {
    ErrorCreateRequest,
    ErrorCreateTls,
    ErrorConnect,
    ErrorDisconnect,
    ErrorSend,
    ErrorEmptyInfo,
}

pub struct LcuWsClient {
    cert: Certificate,
}

impl LcuWsClient {
    pub fn from(pem_bytes: &[u8]) -> Self {
        Self {
            cert: Certificate::from_pem(pem_bytes).unwrap(),
        }
    }

    fn create_tls_connector(&self) -> LcuWsResult<Connector> {
        let cert = self.cert.clone();
        let tls = TlsConnector::builder()
            .add_root_certificate(cert)
            .build()
            .map_err(|_| LcuWsError::ErrorCreateTls)?;

        Ok(Connector::NativeTls(tls))
    }

    pub async fn connect(&self, port: &String, auth_token: &String) -> LcuWsResult<LcuWsStreamType> {
        let connector = self.create_tls_connector()?;
        let req = create_connection_request(port, auth_token)?;

        let (mut s, _) =
            tokio_tungstenite::connect_async_tls_with_config(req, None, false, Some(connector))
                .await
                .map_err(|_| LcuWsError::ErrorConnect)?;

        pre_subscribe(&mut s).await?;

        Ok(s)
    }

    pub async fn connect_with(
        &self,
        process_info: &LcuProcessInfo,
    ) -> LcuWsResult<LcuWsStream> {
        match self.connect(&process_info.port, &process_info.auth_token).await {
            Ok(s) => Ok(LcuWsStream(s)),
            Err(e) => Err(e),
        }
    }
}

fn create_connection_request(port: &String, auth_token: &String) -> LcuWsResult<Request> {
    let mut req = format!("wss://127.0.0.1:{port}")
        .into_client_request()
        .map_err(|_| LcuWsError::ErrorCreateRequest)?;

    req.headers_mut().insert(
        "Authorization",
        HeaderValue::from_str(format!("Basic {auth_token}").as_str()).unwrap(),
    );

    Ok(req)
}

async fn pre_subscribe(s: &mut LcuWsStreamType) -> LcuWsResult<()> {
    s.send(Message::Text("[5, \"OnJsonApiEvent\"]".to_string()))
        .await
        .map_err(|e| match e {
            tungstenite::Error::ConnectionClosed | tungstenite::Error::AlreadyClosed => {
                LcuWsError::ErrorDisconnect
            }
            _ => LcuWsError::ErrorSend,
        })?;

    Ok(())
}
