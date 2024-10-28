use crate::v2::app_states::AppState;
use crate::v2::commands::utils::{need_app_data_dir, need_lcu_process_info};
use crate::v2::consts::dir_names::{SUMMONER_DATA_DIR_NAME, SUMMONER_INFO_FILE_NAME};
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use crate::v2::models::lcu_summoner_info::SummonerInfo;
use crate::v2::models::rest::LcuFetcher;
use crate::v2::utils::create_dir_if_not_exists;
use serde_json::Value;
use std::path::{Path, PathBuf};
use tauri::{command, AppHandle, Runtime, State};
use tokio::io::AsyncWriteExt;


pub async fn record_summoner_into_local(
    data_dir_path: PathBuf,
    info: &SummonerInfo,
) -> tokio::io::Result<()> {
    let summoner_dir = data_dir_path
        .join(SUMMONER_DATA_DIR_NAME)
        .join(&info.puuid);

    create_dir_if_not_exists(&summoner_dir).await?;

    let mut summoner_info_file = tokio::fs::OpenOptions::new()
        .write(true)
        .create(true)
        .open(summoner_dir.join(SUMMONER_INFO_FILE_NAME))
        .await?;

    summoner_info_file
        .write_all(serde_json::to_string_pretty(info).unwrap().as_bytes())
        .await?;

    Ok(())
}

async fn is_summoner_dir(dir: &Path) -> bool {
    dir.join(SUMMONER_INFO_FILE_NAME).is_file()
}

async fn find_summoner_dirs(records_dir: &Path) -> tokio::io::Result<Vec<PathBuf>> {
    let mut results = Vec::new();

    let mut entries = tokio::fs::read_dir(records_dir).await?;

    while let Some(entry) = entries.next_entry().await? {
        let path = entry.path();

        if path.is_dir() && is_summoner_dir(&path).await {
            results.push(path);
        }
    }

    Ok(results)
}

async fn read_one_summoner(summoner_dir: &Path) -> tokio::io::Result<SummonerInfo> {
    let info_file = summoner_dir.join(SUMMONER_INFO_FILE_NAME);
    let text = tokio::fs::read_to_string(&info_file).await?;
    Ok(serde_json::from_str::<SummonerInfo>(&text)?)
}

async fn read_summoners_from_local(records_path: PathBuf) -> tokio::io::Result<Vec<SummonerInfo>> {
    let summoner_dir_vec = find_summoner_dirs(&records_path).await?;

    let mut results = vec![];

    for summoner_dir in summoner_dir_vec {
        match read_one_summoner(&summoner_dir).await {
            Ok(summoner_info) => {
                results.push(summoner_info);
            }
            Err(err) => {
                println!("Error reading summoner from {:?}: {}", summoner_dir, err);
                continue;
            }
        }
    }

    Ok(results)
}

#[command]
pub async fn record_summoner<R: Runtime>(
    app_handle: AppHandle<R>,
    state: State<'_, AppState>,
) -> Result<Value, LcuFetchError> {
    let process_info = need_lcu_process_info(&state)
        .await
        .map_err(|_| LcuFetchError::LcuNotStarted)?;

    let fetcher = LcuFetcher::of(
        &state.rest_client,
        &process_info.port,
        &process_info.auth_token,
    );

    let current_summoner_info = fetcher
        .fetch_without_payload::<SummonerInfo>(
            "/lol-summoner/v1/current-summoner".to_string(),
            2000,
        )
        .await?;

    let data_dir = need_app_data_dir(&app_handle);

    record_summoner_into_local(data_dir, &current_summoner_info)
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

    Ok(Value::Null)
}

#[command]
pub async fn read_local_summoners<R: Runtime>(
    app_handle: AppHandle<R>,
) -> Result<Vec<SummonerInfo>, LcuFetchError> {
    let summoners_data_dir = need_app_data_dir(&app_handle).join(SUMMONER_DATA_DIR_NAME);

    let summoners = read_summoners_from_local(summoners_data_dir)
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

    Ok(summoners)
}
