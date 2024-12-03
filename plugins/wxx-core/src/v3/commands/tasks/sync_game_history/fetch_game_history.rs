use super::models::{GameSelectorAction, GameWithCreation, TaskContext};
use crate::v3::errors::CommandError;
use crate::v3::models::app::states::AppState;
use crate::v3::utils::LcuEndpoints;
use wxx_protobuf::lcu::match_history::{Game, MatchHistory};

pub async fn fetch_game_history(
    fetcher: &AppState,
    ctx: &TaskContext,
    filter: fn(game: &Game) -> bool,
) -> Result<Vec<GameWithCreation>, CommandError> {
    let excepted_game_count = ctx.get_excepted_game_count();
    let mut beg_index = 0;
    let mut game_creations: Vec<GameWithCreation> = Vec::new();

    'outer: loop {
        let match_history = LcuEndpoints::GameHistory(
            ctx.puuid.to_string(),
            beg_index,
            beg_index + excepted_game_count,
        )
        .fetch::<MatchHistory>(fetcher, 0)
        .await?;

        let games = match_history.games.unwrap();
        let game_count = games.game_count;

        for game in games.games.iter() {
            if filter(game) {
                match ctx.select_game(game) {
                    GameSelectorAction::Drop => continue,
                    GameSelectorAction::Accept => game_creations.push(GameWithCreation {
                        game_id: game.game_id as i64,
                        creation: game.game_creation as i64,
                    }),
                    GameSelectorAction::End => break 'outer,
                }
            }
        }

        if game_count < excepted_game_count {
            break;
        }

        beg_index += game_count;
    }

    Ok(game_creations)
}
