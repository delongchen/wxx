use serde::{Serialize, Serializer};
use serde_json::Value;

pub enum LcuFetchError {
    LcuNotStarted,
    CreateRequestError,
    SendRequestError(String),
    RequestNotSuccess(Value),
    ResponseDeserializationError(String),
    FsError(String),
}

#[derive(Serialize)]
struct LcuFetchErrorWrapper {
    code: u8,
    message: String,
}

impl LcuFetchError {
    fn wrap(&self) -> LcuFetchErrorWrapper {
        match self {
            Self::LcuNotStarted => LcuFetchErrorWrapper {
                code: 0,
                message: "lcu not started".to_string(),
            },
            Self::CreateRequestError => LcuFetchErrorWrapper {
                code: 1,
                message: "create request error".to_string(),
            },
            Self::SendRequestError(message) => LcuFetchErrorWrapper {
                code: 2,
                message: message.to_string(),
            },
            Self::RequestNotSuccess(err) => LcuFetchErrorWrapper {
                code: 3,
                message: err.to_string(),
            },
            Self::ResponseDeserializationError(message) => LcuFetchErrorWrapper {
                code: 4,
                message: message.to_string(),
            },
            Self::FsError(message) => LcuFetchErrorWrapper {
                code: 5,
                message: message.to_string(),
            }
        }
    }
}

impl serde::Serialize for LcuFetchError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.wrap().serialize(serializer)
    }
}
