use serde::Serialize;
use serde_json::{json};
use tauri::{AppHandle, Runtime, Manager};
use crate::helper::process_watcher::LcuProcessStatus;

static WXX_LCU_STATUS_EVENT: &str = "WXX_LCU_STATUS_EVENT";

pub struct AppEmitter<R: Runtime>(AppHandle<R>);

impl <R: Runtime>AppEmitter<R> {
    pub fn from(app: &AppHandle<R>) -> Self {
        Self(app.clone())
    }

    pub fn emit<S: Serialize + Clone>(&self, ev: &str, payload: S) {
        self.0.emit(ev, payload).unwrap();
    }

    pub fn emit_status(&self, status: &LcuProcessStatus) {
        let status_code = match status {
            LcuProcessStatus::NotStarted => 0,
            LcuProcessStatus::NotStartedWithAdmin => 1,
            LcuProcessStatus::Started(_) => 2,
        };

        self.emit(WXX_LCU_STATUS_EVENT, json!({"status": status_code}));
    }
}
