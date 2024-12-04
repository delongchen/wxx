use crate::v3::errors::CommandError;
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
use models::MessageSender;
use selector::is_good_dld;

#[tauri::command]
pub async fn sync_games_by_puuid(
    db: State<'_, WxxSqlite>,
    fetcher: State<'_, AppState>,
    puuid: String,
    chan: Channel<serde_json::Value>,
) -> Result<(), CommandError> {
    let sender = MessageSender::cover(chan);

    sender.task_created(&puuid);

    fetcher
        .need_lcu_process_info()
        .await
        .inspect_err(|_| sender.task_end(1))?;

    let ctx = db.new_task_ctx_from_cache(&puuid).await?;

    let uncached_games = fetch_game_history(&ctx, &sender, &fetcher, is_good_dld).await?;

    // nothing to fetch, end task
    if uncached_games.len() == 0 {
        db.insert_latest_sync_time(&puuid)
            .await
            .inspect_err(|_| sender.task_end(2))?;

        sender.task_end(0);
        return Ok(());
    }

    let games_to_insert = fetch_game_details(
        &sender,
        &fetcher,
        uncached_games.iter().map(|game| game.game_id).collect(),
        5,
    )
    .await;

    db.insert_games(&games_to_insert)
        .await
        .inspect_err(|_| sender.task_end(2))?;

    db.insert_latest_sync_time(&puuid)
        .await
        .inspect_err(|_| sender.task_end(2))?;

    sender.task_end(0);
    Ok(())
}
