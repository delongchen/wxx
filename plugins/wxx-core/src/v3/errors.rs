use serde::ser::SerializeStruct;
use serde::{Serialize, Serializer};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum LcuRestError {
    #[error("method `{0}` not allowed")]
    MethodNotAllowed(String),

    #[error("illegal endpoint `{0}`")]
    IllegalEndpoint(String),

    #[error("request failed")]
    RequestError(#[from] reqwest::Error),

    #[error("unknown error")]
    Unknown,
}

impl Serialize for LcuRestError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("LcuRestError", 2)?;

        match self {
            LcuRestError::MethodNotAllowed(msg) => {
                state.serialize_field("code", "METHOD_NOT_ALLOW")?;
                state.serialize_field("message", msg)?;
            }
            LcuRestError::IllegalEndpoint(msg) => {
                state.serialize_field("code", "BAD_ENDPOINT")?;
                state.serialize_field("message", msg)?;
            }
            LcuRestError::RequestError(err) => {
                state.serialize_field("code", "REQUEST_ERROR")?;
                state.serialize_field("message", &err.to_string())?;
            }
            LcuRestError::Unknown => {
                state.serialize_field("code", "UNKNOWN_ERROR")?;
            }
        }

        state.end()
    }
}

#[derive(Error, Debug)]
pub enum LcuWSError {
    #[error("build certificate failed")]
    BuildCertificateFailed,

    #[error("build connect request failed")]
    BuildConnectRequestFailed,

    #[error("connect ws failed")]
    ConnectFailed,

    #[error("send message failed")]
    SendMessageFailed(#[from] tokio_tungstenite::tungstenite::Error),
}

#[derive(Error, Debug, Serialize)]
pub enum LcuProcessError {
    #[error("lcu process not started or started without admin")]
    NotStarted,
}

#[derive(Error, Debug, Serialize)]
pub enum DatabaseQueryError {
    #[error("fetch failed")]
    FetchError(String),
    
    #[error("execute failed")]
    ExecuteError(String),
}

#[derive(Error, Debug, Serialize)]
pub enum AppInternalError {
    #[error("lcu rest error")]
    LcuRestError(#[from] LcuRestError),

    #[error("lcu process error")]
    LcuProcessError(#[from] LcuProcessError),
    
    #[error("database query error")]
    DatabaseError(#[from] DatabaseQueryError),
}

#[derive(Error, Debug, Serialize)]
pub enum CommandError {
    #[error("encode response failed")]
    EncodeResultFailed,

    #[error("command failed")]
    InternalError(#[from] AppInternalError),
}
