use std::time::Duration;
use sysinfo::{ System };
use base64::{engine::general_purpose, Engine};
use serde_json::json;
use tauri::{AppHandle, Manager, Runtime};
use tauri::async_runtime::JoinHandle;
use super::models::process::{LcuProcessStatus, LcuProcessInfo};
use tokio::time::sleep;
use crate::v2::app_states::AppState;
use crate::v2::consts::LCU_PROCESS_STATUS_CHANGE;

#[cfg(target_os = "windows")]
const TARGET_PROCESS: &str = "LeagueClientUx.exe";
#[cfg(target_os = "linux")]
const TARGET_PROCESS: &str = "LeagueClientUx.";
#[cfg(target_os = "macos")]
const TARGET_PROCESS: &str = "LeagueClientUx";

enum LcuProcessError {
    ProcessNotFound,
    ArgValueNotFound,
}

fn find_arg_value(args: &[String], flag: &str) -> Result<String, LcuProcessError> {
    args
        .iter()
        .find(|arg| arg.starts_with(flag))
        .map(|arg| arg.strip_prefix(flag).unwrap().to_string())
        .ok_or(LcuProcessError::ArgValueNotFound)
}

fn fetch_lcu_info() -> Result<LcuProcessInfo, LcuProcessError> {
    let mut sys = System::new_all();
    sys.refresh_processes();

    let lcu_args = sys
        .processes()
        .values()
        .find(|process| process.name() == TARGET_PROCESS)
        .map(|process| process.cmd())
        .ok_or(LcuProcessError::ProcessNotFound)?;

    let port = find_arg_value(lcu_args, "--app-port=")?;
    let auth_token = find_arg_value(lcu_args, "--remoting-auth-token=")?;

    Ok(LcuProcessInfo {
        port,
        auth_token: general_purpose::STANDARD.encode(format!("riot:{}", auth_token)),
    })
}

fn get_lcu_status() -> LcuProcessStatus {
    match fetch_lcu_info() {
        Ok(info) => LcuProcessStatus::Started(info),
        Err(e) => {
            match e {
                LcuProcessError::ProcessNotFound => LcuProcessStatus::NotStarted,
                LcuProcessError::ArgValueNotFound => LcuProcessStatus::NotStartedWithAdmin,
            }
        }
    }
}

pub fn start_watcher<R: Runtime>(app: &AppHandle<R>, timeout: u64) -> JoinHandle<()> {
    let app = app.clone();

    let handle = tauri::async_runtime::spawn(async move {
        let state = app.state::<AppState>();

        loop {
            let cur_status = get_lcu_status();
            let mut status_code: u8 = 0;

            {
                let mut prev_status = state.process_status.lock().await;
                if cur_status != *prev_status {
                    status_code = match cur_status {
                        LcuProcessStatus::Started(_) => 3,
                        LcuProcessStatus::NotStartedWithAdmin => 2,
                        LcuProcessStatus::NotStarted => 1,
                    };
                    *prev_status = cur_status;
                }
            }

            if status_code != 0 {
                let _ = app.emit(
                    LCU_PROCESS_STATUS_CHANGE,
                    json!({
                        "statusCode": status_code
                    }),
                );
            }

            sleep(Duration::from_millis(timeout)).await;
        }
    });

    handle
}
