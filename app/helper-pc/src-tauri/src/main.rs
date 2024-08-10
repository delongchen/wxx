// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_wxx_core::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
