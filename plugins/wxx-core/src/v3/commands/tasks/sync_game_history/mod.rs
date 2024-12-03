use crate::v3::errors::{AppInternalError, CommandError};
use crate::v3::models::app::states::AppState;
use crate::v3::models::db::WxxSqlite;
use tauri::ipc::Channel;
use tauri::State;

mod db_helper;
mod fetch_game_details;
mod fetch_game_history;
mod models;
mod selector;
mod utils;

use db_helper::LcuDbHelper;
use fetch_game_details::fetch_game_details;
use fetch_game_history::fetch_game_history;
use models::TaskContext;
use selector::is_good_dld;

#[tauri::command]
pub async fn sync_games_by_puuid(
    db: State<'_, WxxSqlite>,
    state: State<'_, AppState>,
    puuid: String,
    full_update: bool,
    chan: Channel<serde_json::Value>,
) -> Result<(), CommandError> {
    state
        .need_lcu_process_info()
        .await
        .map_err(|e| AppInternalError::LcuProcessError(e))?;

    let fetcher: &AppState = &state;

    let (latest_game_creation, cached_game_id_set, last_sync_time_ms) =
        db.get_cached_game_info(&puuid).await?;

    let ctx = TaskContext::new(
        puuid.clone(),
        full_update,
        latest_game_creation,
        cached_game_id_set,
        last_sync_time_ms,
    );

    let uncached_games = fetch_game_history(fetcher, &ctx, is_good_dld).await?;

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
