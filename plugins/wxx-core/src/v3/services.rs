use crate::v3::models::lcu::process_status::LcuProcessInfo;
use tauri::{AppHandle, Runtime};
use tokio::sync::mpsc;

mod listen_lcu_events;
mod listen_lcu_process;

pub fn start_services<R: Runtime>(app_handle: &AppHandle<R>) {
    let (process_info_tx, process_info_rx) = mpsc::channel::<LcuProcessInfo>(1);

    listen_lcu_events::spawn_lcu_events_listener(app_handle, process_info_rx);
    listen_lcu_process::spawn_lcu_process_watcher(app_handle, 1000, process_info_tx);
}
