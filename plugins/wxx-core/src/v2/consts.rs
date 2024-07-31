pub mod events;

pub const RIOT_GAMES_PEM_BYTES: &[u8] = include_bytes!("./riotgames.pem");

pub const LCU_WS_EVENT: &str = "LCU_WS_EVENT";
pub const LCU_PROCESS_STATUS_CHANGE: &str = "LCU_PROCESS_STATUS_CHANGE";