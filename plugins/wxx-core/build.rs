const COMMANDS: &[&str] = &[
    "lcu_fetch", 
    "read_config", 
    "write_config",
    "fetch_match_history",
    "read_local_summoners",
    "record_summoner",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
