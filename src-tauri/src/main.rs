// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod client;
pub mod event;
use client::{handle_get_request, handle_post_request, LolApiClient};
use event::start_listen_lcu_event;
use tokio::sync::RwLock;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    let api_client = Arc::new(RwLock::new(None));
    let client_clone = Arc::clone(&api_client);

    std::thread::spawn(move || {
        let client = LolApiClient::new();
        let mut write_guard = client_clone.blocking_write();
        *write_guard = Some(client);
    });


    tauri::Builder::default()
        .manage(api_client)
        .invoke_handler(tauri::generate_handler![
            handle_get_request,
            handle_post_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}