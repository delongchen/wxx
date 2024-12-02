const COMMANDS: &[&str] = &[
    "lcu_fetch",
    "sync_games_by_puuid",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
