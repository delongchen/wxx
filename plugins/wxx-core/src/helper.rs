mod process_watcher;
mod app_emitter;
mod state_manager;
mod rest_client;
mod cert;
mod commands;

use std::time::Duration;
use process_watcher::{get_lcu_status};

use tauri::{AppHandle, Manager, Runtime};
use tokio::time::sleep;
use crate::helper::state_manager::LcuStatusState;

pub fn init<R: Runtime>(app: &AppHandle<R>) {
    state_manager::init(app);

    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let app = app;
        let emitter = app_emitter::AppEmitter::from(&app);
        let status_state = app.state::<LcuStatusState>();

        loop {
            let _cur_status = get_lcu_status();
            let _prev_status = status_state.0.lock().await;

            sleep(Duration::from_millis(1000)).await;
        }
    });
}
