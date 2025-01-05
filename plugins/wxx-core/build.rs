const COMMANDS: &[&str] = &[
    "lcu_fetch",
    "sync_games_by_puuid",
    "fetch_game_history",
    "query_game",
    "query_summoners",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
