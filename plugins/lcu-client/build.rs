const COMMANDS: &[&str] = &[
    "connect_lcu_client",
    "handle_get_request",
    "handle_post_request",
    "start_listen_lcu_event",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
