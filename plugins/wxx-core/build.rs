const COMMANDS: &[&str] = &["handle_get_request", "handle_post_request"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
