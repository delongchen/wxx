use crate::v2::app_states::AppState;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub mod v2;

//  Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("wxx-core")
        .invoke_handler(tauri::generate_handler![
            v2::commands::config::read_config,
            v2::commands::config::write_config,
            v2::commands::request::lcu_fetch,
        ])
        .setup(|app, _api| {
            app.manage(AppState::empty());

            v2::create_app_dir(app, vec!["wxsb/configs", "wxsb/temp"]);

            v2::process_watcher::start_watcher(app, 1000);
            v2::ws_client::start_ws_client(app, 1000);

            Ok(())
        })
        .build()
}
