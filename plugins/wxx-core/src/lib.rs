use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

mod consts;
mod v2;
mod v3;

//  Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("wxx-core")
        .invoke_handler(tauri::generate_handler![v3::commands::core::lcu_fetch,])
        .setup(|app, _api| {
            app.manage(v3::models::app::states::AppState::default());

            v3::services::start_services(app);

            v2::preload::preload(app);
            Ok(())
        })
        .build()
}
