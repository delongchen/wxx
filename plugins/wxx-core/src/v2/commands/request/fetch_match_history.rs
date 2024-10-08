use super::utils::{check_lcu_started, send_request};
use crate::v2::app_states::AppState;
use crate::v2::consts::LCU_MATCH_HISTORY_TASK;
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use crate::v2::models::lcu_match_history::{Game, MatchHistory};
use crate::v2::utils::create_dir_if_not_exists;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{command, AppHandle, Emitter, Manager, Runtime, State};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt};

const HISTORY_WINDOW_WIDTH_WIDE: u32 = 200;
const HISTORY_WINDOW_WIDTH_NARROW: u32 = 20;

#[derive(Serialize, Clone)]
#[repr(u8)]
enum FetchMatchHistoryStage {
    StartTask = 0,
    ScanningIndex,
    ScannedIndex,
    FetchingMatchDetail,
    FetchedMatchDetail,
    EndTask,
}

#[derive(Serialize, Clone)]
struct FetchMatchHistoryEvent {
    pub puuid: String,
    pub stage: FetchMatchHistoryStage,
    pub data: Value,
}

#[derive(Deserialize)]
struct SummonerInfo {
    pub puuid: String,
}

async fn read_local_match_index(file: &mut tokio::fs::File) -> tokio::io::Result<Vec<(u64, u64)>> {
    let mut match_history_vec: Vec<(u64, u64)> = vec![];
    let reader = tokio::io::BufReader::new(file);
    let mut lines = reader.lines();

    while let Some(line) = lines.next_line().await? {
        let nums: Vec<&str> = line.split(',').collect();
        if nums.len() >= 2 {
            if let (Ok(game_id), Ok(game_creation)) =
                (nums[0].parse::<u64>(), nums[1].parse::<u64>())
            {
                match_history_vec.push((game_id, game_creation));
            }
        }
    }

    Ok(match_history_vec)
}

#[command]
pub async fn fetch_match_history<R: Runtime>(
    app_handle: AppHandle<R>,
    state: State<'_, AppState>,
    puuid: Option<String>,
) -> Result<Value, LcuFetchError> {
    let process_info = check_lcu_started(&state).await?;

    let create_req = |url: &str, timeout: u64| {
        state
            .rest_client
            .create_request(
                "GET",
                url,
                &Value::Null,
                &process_info.port,
                &process_info.auth_token,
                timeout,
            )
            .map_err(|_| LcuFetchError::CreateRequestError)
    };

    let puuid = match puuid {
        None => {
            let summoner_info_req = create_req("/lol-summoner/v1/current-summoner", 2000)?;
            let summoner_info = send_request::<SummonerInfo>(summoner_info_req).await?;
            summoner_info.puuid
        }
        Some(puuid) => puuid,
    };

    let request_match_detail = |game_id: u64| {
        let url = format!("/lol-match-history/v1/games/{game_id}", game_id = game_id);
        create_req(url.as_str(), 2000)
    };

    let emit_fetch_stage = |stage: FetchMatchHistoryStage, data: Value| {
        app_handle
            .emit(
                LCU_MATCH_HISTORY_TASK,
                FetchMatchHistoryEvent {
                    stage,
                    data,
                    puuid: puuid.clone(),
                },
            )
            .unwrap();
    };

    emit_fetch_stage(FetchMatchHistoryStage::StartTask, json!({}));

    let mut user_dir = app_handle.path().data_dir().unwrap();
    user_dir.push("wxsb");
    user_dir.push("users");
    user_dir.push(&puuid);
    create_dir_if_not_exists(&user_dir).await.unwrap();

    let mut match_history_index_file = tokio::fs::OpenOptions::new()
        .append(true)
        .read(true)
        .create(true)
        .open(user_dir.join("match_history_index"))
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

    let match_index = read_local_match_index(&mut match_history_index_file)
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

    let index_fetch_width = if match_index.len() == 0 {
        HISTORY_WINDOW_WIDTH_WIDE
    } else {
        HISTORY_WINDOW_WIDTH_NARROW
    };

    let request_matches_at = |beg_index: u32, timeout: u64| {
        let puuid = &puuid;
        let url = format!(
            "/lol-match-history/v1/products/lol/{puuid}/matches?begIndex={beg}&endIndex={end}",
            puuid = &puuid,
            beg = beg_index,
            end = beg_index + index_fetch_width - 1,
        );
        create_req(url.as_str(), timeout)
    };

    let mut beg_index = 0;
    let mut error_count = 0;
    let mut matches_to_fetch: Vec<(u64, u64)> = vec![];
    let latest_creation: u64 = if match_index.len() == 0 {
        0
    } else {
        match_index.last().unwrap().1
    };

    'outer: loop {
        let req = request_matches_at(beg_index, 10000 + error_count * 5000)?;
        emit_fetch_stage(
            FetchMatchHistoryStage::ScanningIndex,
            json!({
                "begIndex": beg_index,
                "endIndex": beg_index + index_fetch_width - 1
            }),
        );

        let res = send_request::<MatchHistory>(req).await;
        if let Ok(res) = res {
            error_count = 0;

            for game in &res.games.games {
                if game.game_mode == "ARAM"
                    && game.game_type == "MATCHED_GAME"
                    && game.end_of_game_result == "GameComplete"
                {
                    if game.game_creation <= latest_creation {
                        break 'outer;
                    }

                    matches_to_fetch.push((game.game_id, game.game_creation));
                }
            }
            if res.games.game_count < index_fetch_width {
                break;
            }
            beg_index += index_fetch_width;
        } else {
            if error_count > 3 {
                emit_fetch_stage(FetchMatchHistoryStage::EndTask, json!({ "ok": false }));
                return Err(LcuFetchError::RequestNotSuccess(json!({})))
            }
            error_count += 1;
        }
    }
    let updated_matches_len = matches_to_fetch.len();
    if updated_matches_len == 0 {
        emit_fetch_stage(FetchMatchHistoryStage::EndTask, json!({ "ok": true }));
        return Ok(json!({}));
    }
    emit_fetch_stage(
        FetchMatchHistoryStage::ScannedIndex,
        json!({ "indexCount": updated_matches_len }),
    );

    let mut history_cache_file = tokio::fs::OpenOptions::new()
        .append(true)
        .create(true)
        .open(user_dir.join("match_history_cache"))
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

    matches_to_fetch.sort_by(|a, b| a.1.cmp(&b.1));
    let mut match_cache_buffer = String::new();
    let mut match_index_buffer = String::new();
    let mut matches_fetched = 0;
    emit_fetch_stage(
        FetchMatchHistoryStage::FetchingMatchDetail,
        json!({ "indexCount": updated_matches_len }),
    );
    for (game_id, _) in &matches_to_fetch {
        let req = request_match_detail(*game_id)?;

        let res = send_request::<Game>(req).await?;

        match_cache_buffer.push_str(&serde_json::to_string(&res).unwrap());
        match_cache_buffer.push('\n');
        match_index_buffer.push_str(&format!("{},{}\n", res.game_id, res.game_creation));

        matches_fetched += 1;
        if matches_fetched == 20 {
            emit_fetch_stage(
                FetchMatchHistoryStage::FetchedMatchDetail,
                json!({ "fetched": matches_fetched }),
            );
            matches_fetched = 0;
        }
    }
    emit_fetch_stage(
        FetchMatchHistoryStage::FetchedMatchDetail,
        json!({ "fetched": matches_fetched }),
    );

    history_cache_file
        .write_all(match_cache_buffer.as_bytes())
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

    match_history_index_file
        .write_all(match_index_buffer.as_bytes())
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

    emit_fetch_stage(FetchMatchHistoryStage::EndTask, json!({ "ok": true }));

    Ok(json!({}))
}
