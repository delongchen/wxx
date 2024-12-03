use super::utils::select_excepted_game_count;
use prost::Message;
use sqlx::FromRow;
use std::collections::HashSet;
use wxx_protobuf::lcu::match_history::Game;

#[derive(FromRow)]
pub struct GameWithCreation {
    pub game_id: i64,
    pub creation: i64,
}

pub struct GameEntry(pub i64, pub Vec<String>, pub Vec<u8>);

impl GameEntry {
    pub fn from_game(game: &Game) -> Self {
        let mut puuid_list = Vec::new();
        for id in game.participant_identities.iter() {
            let player = id.player.as_ref().unwrap();
            puuid_list.push(player.puuid.to_string());
        }

        let mut body: Vec<u8> = Vec::new();
        game.encode(&mut body).unwrap();
        Self(game.game_id as i64, puuid_list, body)
    }
}

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
        select_excepted_game_count(self.last_sync_time_ms, self.full_update)
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
