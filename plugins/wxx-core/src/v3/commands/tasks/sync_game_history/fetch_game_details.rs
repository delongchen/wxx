use crate::v3::commands::tasks::models::MessageSender;
use crate::v3::models::app::states::AppState;
use crate::v3::utils::LcuEndpoints;
use futures_util::{stream, StreamExt};
use serde_json::json;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use wxx_protobuf::lcu::match_history::Game;

pub async fn fetch_game_details(
    sender: &MessageSender,
    fetcher: &AppState,
    game_id_vec: Vec<i64>,
    buffer_size: usize,
) -> (Vec<Game>, bool) {
    let tasks_len = game_id_vec.len();
    let success_count = Arc::new(AtomicUsize::new(0));
    let temp_count = Arc::new(AtomicUsize::new(0));

    sender.fetching_detail(0, None);

    let game_details = stream::iter(game_id_vec)
        .map(|game_id| async move {
            LcuEndpoints::GameDetail(game_id as u64)
                .fetch::<Game>(fetcher, 0)
                .await
        })
        .buffer_unordered(buffer_size)
        .filter_map(|response| {
            let success_count = Arc::clone(&success_count);
            let temp_count = Arc::clone(&temp_count);

            async move {
                if let Ok(response) = response {
                    success_count.fetch_add(1, Ordering::Relaxed);
                    temp_count.fetch_add(1, Ordering::Relaxed);

                    if let Ok(_) =
                        temp_count.compare_exchange(20, 0, Ordering::Relaxed, Ordering::Relaxed)
                    {
                        sender.fetching_detail(
                            1,
                            Some(json!({
                                "fetched": success_count.load(Ordering::Relaxed),
                                "tasks": tasks_len,
                            })),
                        )
                    }

                    Some(response)
                } else {
                    None
                }
            }
        })
        .collect::<Vec<_>>()
        .await;

    sender.fetching_detail(
        1,
        Some(json!({
            "fetched": success_count.load(Ordering::Relaxed),
            "tasks": tasks_len,
        })),
    );

    let full_updated = success_count.load(Ordering::Relaxed) == tasks_len;
    sender.fetching_detail(2, Some(json!({ "full": full_updated })));

    (game_details, full_updated)
}
