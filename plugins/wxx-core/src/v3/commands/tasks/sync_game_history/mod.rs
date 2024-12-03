use crate::v3::errors::{AppInternalError, CommandError};
use crate::v3::models::app::states::AppState;
use crate::v3::models::db::WxxSqlite;
use crate::v3::utils::LcuEndpoints;
use futures_util::{stream, StreamExt};
use tauri::ipc::Channel;
use tauri::{AppHandle, Manager, Runtime, State};
use wxx_protobuf::lcu::match_history::{Game, MatchHistory};

mod tools;
use tools::{
    select_excepted_game_count, GameWithCreation, LcuDbTools, MAX_SAFE_EXCEPTED_GAME_COUNT,
};

const GAME_MODE_ARAM: &str = "ARAM";
const GAME_TYPE_MATCHED: &str = "MATCHED_GAME";
const GAME_END_OF_COMPLETE: &str = "GameComplete";

#[tauri::command]
pub async fn fetch_game_history<R: Runtime>(
    app_handle: AppHandle<R>,
    state: State<'_, AppState>,
    puuid: String,
    start: u32,
    end: u32,
) -> Result<(), CommandError> {
    state
        .need_lcu_process_info()
        .await
        .map_err(|e| AppInternalError::LcuProcessError(e))?;

    let fetcher: &AppState = &state;

    let match_history = LcuEndpoints::GameHistory(puuid.to_string(), start, end)
        .fetch::<serde_json::Value>(fetcher, 0)
        .await?;

    let text = serde_json::to_string(&match_history).unwrap();

    let file_path = app_handle
        .path()
        .data_dir()
        .unwrap()
        .join("wxsb")
        .join("chunk.json");

    std::fs::write(file_path, text).unwrap();

    Ok(())
}

async fn get_uncached_games(
    db: &WxxSqlite,
    fetcher: &AppState,
    puuid: &str,
    full: bool,
    chan: &Channel<serde_json::Value>,
) -> Result<Vec<GameWithCreation>, CommandError> {
    let (latest_creation, cached_game_id_set) = db.read_cached_games(&puuid).await?;
    let last_sync_time_ms = db.read_latest_sync_time(&puuid).await?;

    let expected_game_count = if full || latest_creation == 0 {
        MAX_SAFE_EXCEPTED_GAME_COUNT
    } else {
        select_excepted_game_count(last_sync_time_ms)
    };

    let mut beg_index = 0;
    let mut uncached_games: Vec<GameWithCreation> = Vec::new();
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

    Ok(uncached_games)
}

async fn fetch_game_details(
    fetcher: &AppState,
    game_id_vec: Vec<i64>,
    buffer_size: usize,
) -> Vec<Game> {
    let game_details = stream::iter(game_id_vec)
        .map(|game_id| async move {
            LcuEndpoints::GameDetail(game_id as u64)
                .fetch::<Game>(fetcher, 0)
                .await
        })
        .buffer_unordered(buffer_size)
        .collect::<Vec<_>>()
        .await
        .into_iter()
        .filter_map(Result::ok)
        .collect::<Vec<_>>();

    game_details
}

#[tauri::command]
pub async fn sync_games_by_puuid(
    db: State<'_, WxxSqlite>,
    state: State<'_, AppState>,
    puuid: String,
    full: bool,
    chan: Channel<serde_json::Value>,
) -> Result<(), CommandError> {
    state
        .need_lcu_process_info()
        .await
        .map_err(|e| AppInternalError::LcuProcessError(e))?;

    let fetcher: &AppState = &state;

    let uncached_games = get_uncached_games(&db, fetcher, &puuid, full, &chan).await?;

    if uncached_games.len() == 0 {
        db.record_latest_sync_time(&puuid).await?;
        return Ok(());
    }

    let games_to_insert = fetch_game_details(
        fetcher,
        uncached_games.iter().map(|game| game.game_id).collect(),
        5,
    )
    .await;

    db.insert_games(&games_to_insert).await?;
    db.record_latest_sync_time(&puuid).await?;

    Ok(())
}
