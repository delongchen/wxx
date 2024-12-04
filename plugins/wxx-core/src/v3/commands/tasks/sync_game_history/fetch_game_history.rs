use super::models::{GameSelectorAction, GameWithCreation, MessageSender, TaskContext};
use crate::v3::errors::CommandError;
use crate::v3::models::app::states::AppState;
use crate::v3::utils::LcuEndpoints;
use serde_json::json;
use wxx_protobuf::lcu::match_history::{Game, MatchHistory};

const STATUS_START: u8 = 0;
const STATUS_PROCESS: u8 = 1;
const STATUS_END: u8 = 2;

pub async fn fetch_game_history(
    ctx: &TaskContext,
    sender: &MessageSender,
    fetcher: &AppState,
    filter: fn(game: &Game) -> bool,
) -> Result<Vec<GameWithCreation>, CommandError> {
    let excepted_game_count = ctx.get_excepted_game_count();
    let mut beg_index = 0;
    let mut game_creations: Vec<GameWithCreation> = Vec::new();
    let mut all = 0;

    sender.fetching_history(STATUS_START, None);

    'outer: loop {
        let start_index = beg_index;
        let end_index = beg_index + excepted_game_count;
        let puuid = ctx.puuid.to_string();

        sender.fetching_history(
            STATUS_PROCESS,
            Some(json!({ "start_index": start_index, "end_index": end_index })),
        );

        let match_history = LcuEndpoints::GameHistory(puuid, start_index, end_index)
            .fetch::<MatchHistory>(fetcher, 0)
            .await
            .inspect_err(|_| sender.task_end(2))?;

        let games = match_history.games.unwrap();
        let game_count = games.game_count;

        for game in games.games.iter() {
            if filter(game) {
                match ctx.select_game(game) {
                    GameSelectorAction::Drop => continue,
                    GameSelectorAction::Accept => {
                        all += 1;
                        game_creations.push(GameWithCreation {
                            game_id: game.game_id as i64,
                            creation: game.game_creation as i64,
                        })
                    }
                    GameSelectorAction::End => break 'outer,
                }
            }
        }

        if game_count < excepted_game_count {
            break;
        }

        beg_index += game_count;
    }

    sender.fetching_history(STATUS_END, Some(json!({ "all": all })));

    Ok(game_creations)
}
