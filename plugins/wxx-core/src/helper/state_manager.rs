use tauri::{AppHandle, Manager, Runtime};
use tokio::sync::Mutex;
use crate::helper::process_watcher::LcuProcessStatus;
use crate::helper::rest_client::WxxRestClient;

pub struct LcuStatusState(pub Mutex<LcuProcessStatus>);

pub fn init<R: Runtime>(app: &AppHandle<R>) {
    app.manage(WxxRestClient::new());
    app.manage(LcuStatusState(Mutex::new(LcuProcessStatus::NotStarted)));
}
