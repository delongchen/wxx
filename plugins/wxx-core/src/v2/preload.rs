use tauri::{AppHandle, Runtime};

pub fn preload<R: Runtime>(_app: &AppHandle<R>) {
    println!("preload");
}
