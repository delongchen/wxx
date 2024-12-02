use crate::v3::errors::CommandError;
use crate::v3::models::app::states::AppState;
use crate::v3::models::db::WxxSqlite;
use crate::v3::utils::LcuEndpoints;
use tauri::ipc::Channel;
use tauri::{State};
use wxx_protobuf::lcu::match_history::{Game, MatchHistory};

mod tools;
use tools::{
    select_excepted_game_count, GameEntry, GameWithCreation, LcuDbTools,
    MAX_SAFE_EXCEPTED_GAME_COUNT,
};

const GAME_MODE_ARAM: &str = "ARAM";
const GAME_TYPE_MATCHED: &str = "MATCHED_GAME";
const GAME_END_OF_COMPLETE: &str = "GameComplete";

#[tauri::command]
pub async fn sync_games_by_puuid(
    db: State<'_, WxxSqlite>,
    state: State<'_, AppState>,
    puuid: String,
    full: bool,
    chan: Channel<serde_json::Value>,
) -> Result<(), CommandError> {
    let fetcher: &AppState = &state;
    
    chan.send(serde_json::json!({ "task": "start" })).unwrap();

    let (latest_creation, cached_game_id_set) = db.read_cached_games(&puuid).await?;
    let last_sync_time_ms = db.read_latest_sync_time(&puuid).await?;

    let mut uncached_games: Vec<GameWithCreation> = Vec::new();
    let mut beg_index = 0;

    let expected_game_count = if full || latest_creation == 0 {
        MAX_SAFE_EXCEPTED_GAME_COUNT
    } else {
        select_excepted_game_count(last_sync_time_ms)
    };

    'outer: loop {
        let match_history = LcuEndpoints::GameHistory(
            puuid.to_string(),
            beg_index,
            beg_index + expected_game_count,
        )
        .fetch::<MatchHistory>(fetcher, 0)
        .await?;

        let games = match_history.games.unwrap();
        let game_count = games.game_count;

        for game in games.games.iter() {
            if game.game_mode == GAME_MODE_ARAM
                && game.game_type == GAME_TYPE_MATCHED
                && game.end_of_game_result == GAME_END_OF_COMPLETE
            {
                if !full && game.game_creation <= latest_creation as u64 {
                    break 'outer;
                }

                let game_id = game.game_id as i64;
                let creation = game.game_creation as i64;

                if !cached_game_id_set.contains(&game_id) {
                    uncached_games.push(GameWithCreation { game_id, creation })
                }
            }
        }

        if game_count < expected_game_count {
            break;
        }

        beg_index += game_count;
    }
    
    if uncached_games.len() == 0 { 
        return Ok(());
    }
    
    let mut games_to_insert: Vec<GameEntry> = Vec::new();
    
    for game in uncached_games {
        let game_detail = LcuEndpoints::GameDetail(game.game_id as u64)
            .fetch::<Game>(fetcher, 0)
            .await?;
        
        games_to_insert.push(GameEntry::from_game(&game_detail));
    }
    
    db.insert_games(&puuid, games_to_insert).await?;

    Ok(())
}
