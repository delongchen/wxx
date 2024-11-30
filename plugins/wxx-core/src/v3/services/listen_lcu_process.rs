use crate::consts::events::LCU_PROCESS_STATUS_EVENT;
use crate::v3::models::app::states::AppState;
use crate::v3::models::lcu::process_status::{LcuProcessInfo, LcuProcessStatus};
use base64::{engine::general_purpose, Engine};
use std::ffi::OsString;
use std::time::Duration;
use sysinfo::{ProcessRefreshKind, ProcessesToUpdate, System, UpdateKind};
use tauri::async_runtime::JoinHandle;
use tauri::{AppHandle, Emitter, Manager, Runtime};
use tokio::time::sleep;

#[cfg(target_os = "windows")]
const TARGET_PROCESS: &str = "LeagueClientUx.exe";
#[cfg(target_os = "linux")]
const TARGET_PROCESS: &str = "LeagueClientUx.";
#[cfg(target_os = "macos")]
const TARGET_PROCESS: &str = "LeagueClientUx";

enum ScanProcessError {
    ProcessNotFound,
    ArgValueNotFound,
}

fn find_arg_value(args: &[OsString], flag: &str) -> Result<String, ScanProcessError> {
    args.iter()
        .filter_map(|arg| arg.to_str())
        .find(|arg| arg.starts_with(flag))
        .map(|arg| arg.strip_prefix(flag).unwrap().to_string())
        .ok_or(ScanProcessError::ArgValueNotFound)
}

fn scan_lcu_process() -> Result<LcuProcessInfo, ScanProcessError> {
    let mut sys = System::new_all();
    sys.refresh_processes_specifics(
        ProcessesToUpdate::All,
        true,
        ProcessRefreshKind::new().with_cmd(UpdateKind::Always),
    );

    let lcu_args = sys
        .processes()
        .values()
        .find(|process| process.name() == TARGET_PROCESS)
        .map(|process| process.cmd())
        .ok_or(ScanProcessError::ProcessNotFound)?;

    let api_port = find_arg_value(lcu_args, "--app-port=")?;
    let auth_token_raw = find_arg_value(lcu_args, "--remoting-auth-token=")?;

    let auth_token = general_purpose::STANDARD.encode(format!("riot:{}", auth_token_raw));

    Ok(LcuProcessInfo {
        api_port,
        auth_token,
    })
}

fn get_lcu_status() -> LcuProcessStatus {
    match scan_lcu_process() {
        Ok(info) => LcuProcessStatus::Started(info),
        Err(e) => match e {
            ScanProcessError::ProcessNotFound => LcuProcessStatus::NotStarted,
            ScanProcessError::ArgValueNotFound => LcuProcessStatus::NotStartedWithAdmin,
        },
    }
}

pub fn spawn_lcu_process_watcher<R: Runtime>(
    app: &AppHandle<R>,
    interval_ms: u64,
    process_info_sender: tokio::sync::mpsc::Sender<LcuProcessInfo>,
) -> JoinHandle<()> {
    let app = app.clone();

    let handle = tauri::async_runtime::spawn(async move {
        let state = app.state::<AppState>();

        loop {
            let cur_status = get_lcu_status();

            {
                let mut prev_status = state.lcu_process.write().await;
                if cur_status != *prev_status {
                    *prev_status = cur_status.clone();
                }
            }

            let status_code = cur_status.to_code();
            app.emit(LCU_PROCESS_STATUS_EVENT, status_code).unwrap();
            
            if let LcuProcessStatus::Started(process_info) = cur_status {
                if let Err(_) = process_info_sender.send(process_info).await {}
            }

            sleep(Duration::from_millis(interval_ms)).await;
        }
    });

    handle
}
