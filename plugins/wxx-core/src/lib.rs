use tauri::{
    plugin::{ Builder, TauriPlugin },
    Manager, Runtime,
};
use crate::v2::app_states::AppState;

pub mod v2;

//  Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("wxx-core")
        .invoke_handler(tauri::generate_handler![])
        .setup(|app, _api| {
            app.manage(AppState::empty());
            v2::process_watcher::start_watcher(app, 200);
            v2::ws_client::start_ws_client(app, 500);
            Ok(())
        })
        .build()
}
