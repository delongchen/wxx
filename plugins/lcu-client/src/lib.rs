use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub mod commands;
use commands::{
    connect_lcu_client, handle_get_request, handle_post_request, start_listen_lcu_event,
    LcuClientManager,
};

//  Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("lcu-client")
        .invoke_handler(tauri::generate_handler![
            connect_lcu_client,
            handle_get_request,
            handle_post_request,
            start_listen_lcu_event
        ])
        .setup(|app, _api| {
            // manage state so it is accessible by the commands
            app.manage(LcuClientManager::default());
            Ok(())
        })
        .build()
}
