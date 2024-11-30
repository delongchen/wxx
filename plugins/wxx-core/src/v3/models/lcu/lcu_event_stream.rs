use futures_util::StreamExt;
use std::pin::Pin;
use std::task::{Context, Poll};
use tokio::net::TcpStream;
use tokio_tungstenite::tungstenite::{Message};
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream};

type LcuWSStream = WebSocketStream<MaybeTlsStream<TcpStream>>;

pub struct LcuEventStream(pub LcuWSStream);

impl futures_util::Stream for LcuEventStream {
    type Item = String;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        loop {
            return match self.0.poll_next_unpin(cx) {
                Poll::Pending => Poll::Pending,
                Poll::Ready(ready_data) => match ready_data {
                    None => Poll::Ready(None),
                    Some(result) => match result {
                        Ok(message) => match message {
                            Message::Text(text) => Poll::Ready(Some(text)),
                            _ => continue,
                        },
                        Err(_) => Poll::Ready(None),
                    },
                },
            };
        }
    }
}
