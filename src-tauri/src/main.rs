// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod client;
pub mod event;
use client::{handle_get_request, handle_post_request, LolApiClient};
use event::start_listen_lcu_event;

fn main() {
    let api_client = LolApiClient::new();
    tauri::Builder::default()
        .manage(api_client)
        .invoke_handler(tauri::generate_handler![
            handle_get_request,
            handle_post_request,
            start_listen_lcu_event
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
