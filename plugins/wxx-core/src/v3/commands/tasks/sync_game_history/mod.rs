use crate::v3::errors::CommandError;
use crate::v3::models::app::states::AppState;
use crate::v3::models::db::WxxSqlite;
use tauri::ipc::Channel;
use tauri::State;

mod fetch_game_details;
mod fetch_game_history;
mod fetch_summoner;
mod selector;

use crate::v3::commands::tasks::db_helper::LcuDbHelper;
use crate::v3::commands::tasks::models::MessageSender;
use fetch_game_details::fetch_game_details;
use fetch_game_history::fetch_game_history;
use selector::is_good_dld;

const END_WITHOUT_ERROR: u8 = 0;
const LCU_OR_SUMMONER_NOT_FOUND: u8 = 1;
const END_WITH_ERROR: u8 = 2;

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
        .inspect_err(|_| sender.task_end(LCU_OR_SUMMONER_NOT_FOUND))?;

    {
        let summoner = fetch_summoner::fetch_summoner(&fetcher, &puuid)
            .await
            .inspect_err(|_| sender.task_end(LCU_OR_SUMMONER_NOT_FOUND))?;

        db.insert_summoner(summoner).await?;
    };

    let ctx = db.new_task_ctx_from_cache(&puuid).await?;

    let uncached_games = fetch_game_history(&ctx, &sender, &fetcher, is_good_dld).await?;

    // nothing to fetch, end task
    if uncached_games.len() == 0 {
        db.insert_latest_sync_time(&puuid)
            .await
            .inspect_err(|_| sender.task_end(END_WITH_ERROR))?;

        sender.task_end(END_WITHOUT_ERROR);
        return Ok(());
    }

    let games_to_fetch = uncached_games.iter().map(|game| game.game_id).collect();

    let (games_to_insert, full_fetched) =
        fetch_game_details(&sender, &fetcher, games_to_fetch, 5).await;

    db.insert_games(&games_to_insert)
        .await
        .inspect_err(|_| sender.task_end(END_WITH_ERROR))?;

    if full_fetched {
        db.insert_latest_sync_time(&puuid)
            .await
            .inspect_err(|_| sender.task_end(END_WITH_ERROR))?;
    }

    sender.task_end(END_WITHOUT_ERROR);
    Ok(())
}
