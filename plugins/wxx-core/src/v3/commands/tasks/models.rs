use crate::v3::utils::get_since_the_epoch_ms;
use prost::Message;
use serde_json::{json, Value};
use sqlx::FromRow;
use std::collections::HashSet;
use tauri::ipc::Channel;
use wxx_protobuf::lcu::match_history::Game;

const H_MS: i64 = 60 * 60 * 1000;
pub const MAX_SAFE_EXCEPTED_GAME_COUNT: u32 = 200;
pub const GOOD_EXCEPTED_GAME_COUNT: u32 = 10;

#[derive(FromRow)]
pub struct GameWithCreation {
    pub game_id: i64,
    pub creation: i64,
}

#[derive(FromRow)]
pub struct GameRecord {
    pub game_id: i64,
    pub creation: i64,
    pub version: String,
    pub body: Vec<u8>,
}

#[derive(FromRow)]
pub struct SummonerRecord {
    pub puuid: String,
    pub latest_sync: i64,
    pub body: Vec<u8>,
}

impl GameRecord {
    pub fn from_game(game: &Game) -> Self {
        let game_id = game.game_id as i64;
        let creation = game.game_creation as i64;
        let version = game.game_version.clone();
        let body = game.encode_to_vec();

        Self {
            game_id,
            version,
            creation,
            body,
        }
    }

    // pub fn to_game(&self) -> Game { Game::decode(self.body.as_slice()).unwrap() }
}

#[derive(Debug)]
pub struct TaskContext {
    pub puuid: String,
    full_update: bool,
    latest_game_creation: i64,
    cached_game_id_set: HashSet<i64>,
    last_sync_time_ms: i64,
}

pub enum GameSelectorAction {
    Drop,
    Accept,
    End,
}

impl TaskContext {
    pub fn new(
        puuid: String,
        full_update: bool,
        latest_game_creation: i64,
        cached_game_id_set: HashSet<i64>,
        last_sync_time_ms: i64,
    ) -> Self {
        Self {
            puuid,
            full_update,
            latest_game_creation,
            cached_game_id_set,
            last_sync_time_ms,
        }
    }

    pub fn get_excepted_game_count(&self) -> u32 {
        if self.last_sync_time_ms <= 0 || self.full_update {
            return MAX_SAFE_EXCEPTED_GAME_COUNT;
        }

        let since_last_sync_ms = get_since_the_epoch_ms() - self.last_sync_time_ms;
        let since_last_sync_h = (since_last_sync_ms / H_MS) as u32;

        match since_last_sync_h {
            0..GOOD_EXCEPTED_GAME_COUNT => GOOD_EXCEPTED_GAME_COUNT,
            GOOD_EXCEPTED_GAME_COUNT..MAX_SAFE_EXCEPTED_GAME_COUNT => since_last_sync_h,
            _ => MAX_SAFE_EXCEPTED_GAME_COUNT,
        }
    }

    pub fn select_game(&self, game: &Game) -> GameSelectorAction {
        if !self.full_update && game.game_creation <= self.latest_game_creation as u64 {
            return GameSelectorAction::End;
        };

        if !self.cached_game_id_set.contains(&(game.game_id as i64)) {
            GameSelectorAction::Accept
        } else {
            GameSelectorAction::Drop
        }
    }
}

pub struct MessageSender(Channel<Value>);

enum TaskMessage {
    Created(String),
    End(u8),
    History(u8, Option<Value>),
    Detail(u8, Option<Value>),
}

impl TaskMessage {
    fn as_code(&self) -> u8 {
        match self {
            TaskMessage::Created(_) => 0,
            TaskMessage::End(_) => 1,
            TaskMessage::History(_, _) => 2,
            TaskMessage::Detail(_, _) => 3,
        }
    }

    fn get_data_json(&self) -> Value {
        match self {
            TaskMessage::Created(puuid) => json!({ "puuid": puuid }),
            TaskMessage::End(status) => json!({ "status": status }),
            TaskMessage::History(status, value) => {
                json!({ "status": status, "value": value })
            }
            TaskMessage::Detail(status, value) => json!({
                "status": status, "value": value,
            }),
        }
    }

    fn to_json(&self) -> Value {
        json!({
            "code": self.as_code(),
            "data": self.get_data_json()
        })
    }
}

impl MessageSender {
    pub fn cover(channel: Channel<Value>) -> Self {
        Self(channel)
    }

    fn send(&self, message: TaskMessage) {
        self.0.send(message.to_json()).unwrap();
    }

    pub fn task_end(&self, status: u8) {
        self.send(TaskMessage::End(status));
    }

    pub fn task_created(&self, puuid: &str) {
        self.send(TaskMessage::Created(puuid.to_string()));
    }

    pub fn fetching_history(&self, status: u8, value: Option<Value>) {
        self.send(TaskMessage::History(status, value));
    }

    pub fn fetching_detail(&self, status: u8, value: Option<Value>) {
        self.send(TaskMessage::Detail(status, value));
    }
}
