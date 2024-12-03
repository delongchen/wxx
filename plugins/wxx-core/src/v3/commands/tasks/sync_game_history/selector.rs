use wxx_protobuf::lcu::match_history::Game;

const GAME_MODE_ARAM: &str = "ARAM";
const GAME_TYPE_MATCHED: &str = "MATCHED_GAME";
const GAME_END_OF_COMPLETE: &str = "GameComplete";

pub fn is_good_dld(game: &Game) -> bool {
    game.game_mode == GAME_MODE_ARAM
        && game.game_type == GAME_TYPE_MATCHED
        && game.end_of_game_result == GAME_END_OF_COMPLETE
}
