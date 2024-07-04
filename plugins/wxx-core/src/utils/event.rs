use serde_json::Value;

pub enum LcuEvent {
    LcuStateChange,
    LcuWsJsonApi,
    Log,
}

#[derive(Clone, serde::Serialize)]
pub(crate) struct Payload {
    pub data: Value,
    pub key: Option<String>,
}

impl LcuEvent {
    pub fn as_str(&self) -> &str {
        match self {
            LcuEvent::LcuStateChange => "LCU_STATE_CHANGE",
            LcuEvent::LcuWsJsonApi => "LCU_WS_JSON_API",
            LcuEvent::Log => "Log",
        }
    }
}
