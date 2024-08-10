const COMMANDS: &[&str] = &[
    "lcu_fetch",
    "read_config",
    "write_config"
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
