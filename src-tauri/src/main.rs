// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod client;
pub mod event;
pub mod lcu;
use client::{handle_get_request, handle_post_request, LolApiClient};
use event::notify_client_event;
use serde_json::json;
use tauri::async_runtime::block_on;

#[tauri::command]
fn get_client_info() -> serde_json::Value {
    let auth_info = lcu::get_auth_info();
    match auth_info {
        Ok((auth, port)) => json!({
          "auth": auth,
          "port": port
        }),
        Err(e) => {
            print!("get lol client info error {}", e);
            json!({})
        }
    }
}

fn main() {
    let api_client = LolApiClient::new();
    tauri::Builder::default()
        .setup(|_app| block_on(notify_client_event(_app)))
        .manage(api_client)
        .invoke_handler(tauri::generate_handler![
            get_client_info,
            handle_get_request,
            handle_post_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
