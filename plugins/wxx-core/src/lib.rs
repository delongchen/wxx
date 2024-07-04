use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub mod commands;
pub mod utils;
use commands::{handle_get_request, handle_post_request};
use utils::{listen::start_listen_lcu, store::LcuManager};

//  Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("wxx-core")
        .invoke_handler(tauri::generate_handler![
            handle_get_request,
            handle_post_request,
        ])
        .setup(|app, _api| {
            // manage state so it is accessible by the commands
            app.manage(LcuManager::default());
            start_listen_lcu(app.clone());
            Ok(())
        })
        .build()
}
