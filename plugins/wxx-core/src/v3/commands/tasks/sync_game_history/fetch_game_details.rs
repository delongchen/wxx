use super::models::MessageSender;
use crate::v3::models::app::states::AppState;
use crate::v3::utils::LcuEndpoints;
use futures_util::{stream, StreamExt};
use wxx_protobuf::lcu::match_history::Game;

pub async fn fetch_game_details(
    sender: &MessageSender,
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
        .filter_map(|result| match result {
            Ok(game) => Some(game),
            Err(err) => {
                println!("detail Error: {}", err);
                None
            }
        })
        .collect::<Vec<_>>();

    game_details
}
