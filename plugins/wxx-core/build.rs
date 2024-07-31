const COMMANDS: &[&str] = &[
    "lcu_fetch",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
