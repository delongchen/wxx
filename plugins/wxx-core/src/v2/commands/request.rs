use std::time::Duration;
use crate::v2::app_states::AppState;
use crate::v2::models::process::{LcuProcessInfo, LcuProcessStatus};
use reqwest::{RequestBuilder};
use serde::de::DeserializeOwned;
use serde_json::{json, Value};
use tauri::{command, State};
use tokio::time::{sleep, Instant};
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use crate::v2::models::lcu_match_history::{MatchHistory};

const HISTORY_WINDOW_WIDTH: u32 = 200;

async fn check_lcu_started(state: &State<'_, AppState>) -> Result<LcuProcessInfo, LcuFetchError> {
    let status = state.process_status.lock().await.clone();
    
    if let LcuProcessStatus::Started(info) = status {
        Ok(info)
    } else { 
        Err(LcuFetchError::LcuNotStarted)
    }
}

#[command]
pub async fn lcu_fetch(
    state: State<'_, AppState>,
    method: String,
    endpoint: String,
    body: Value,
    timeout: u64,
) -> Result<Value, LcuFetchError> {
    let process_info = check_lcu_started(&state).await?;

    let req = state.rest_client.create_request(
        &method,
        &endpoint,
        &body,
        &process_info.port,
        &process_info.auth_token,
        timeout,
    ).map_err(|_| LcuFetchError::CreateRequestError)?;

    let res = send_request::<Value>(req).await?;

    Ok(res)
}

#[command]
pub async fn fetch_match_history(
    state: State<'_, AppState>,
    puuid: String,
) -> Result<Value, LcuFetchError> {
    let process_info = check_lcu_started(&state).await?;

    let create_req = |url: &str, timeout: u64| {
        state.rest_client.create_request(
            "GET",
            url,
            &Value::Null,
            &process_info.port,
            &process_info.auth_token,
            timeout,
        ).map_err(|_| LcuFetchError::CreateRequestError)
    };

    let request_matches_at = |beg_index: u32| {
        let url = format!(
            "/lol-match-history/v1/products/lol/{puuid}/matches?begIndex={beg}&endIndex={end}",
            puuid = &puuid,
            beg = beg_index,
            end = beg_index + HISTORY_WINDOW_WIDTH - 1,
        );
        create_req(url.as_str(), 20000)
    };

    let request_match_detail = |game_id: u64| {
        let url = format!("/lol-match-history/v1/games/{game_id}", game_id = game_id);
        create_req(url.as_str(), 2000)
    };
    
    let mut match_index: Vec<(u64, u64)> = vec![];
    let mut beg_index = 0;
    let mut error_count = 0;
    loop {
        println!("{}", beg_index);
        let req = request_matches_at(beg_index)?;
        let start = Instant::now();
        let res = send_request::<MatchHistory>(req).await;
        let duration = start.elapsed();
        println!("MatchHistory duration: {:?}", duration);
        
        match res {
            Ok(res) => {
                error_count = 0;
                for game in &res.games.games {
                    if game.game_mode == "ARAM" &&
                        game.game_type == "MATCHED_GAME" &&
                        game.end_of_game_result == "GameComplete"
                    {
                        match_index.push(
                            (game.game_id, game.game_creation)
                        );
                    }
                }
                if res.games.game_count < HISTORY_WINDOW_WIDTH { break }
                beg_index += HISTORY_WINDOW_WIDTH;
                sleep(Duration::from_millis(1000)).await;
            }
            Err(err) => {
                if error_count < 3 {
                    error_count += 1;
                    sleep(Duration::from_millis(1500)).await;
                    continue
                } else { 
                    return Err(err);
                }
            }
        }
    }
    
    println!("{:?}", match_index);

    Ok(json!({}))
}

async fn send_request<T: DeserializeOwned>(
    req: RequestBuilder,
) -> Result<T, LcuFetchError> {
    let res = match req.send().await {
        Ok(res) => res,
        Err(e) => return Err(LcuFetchError::SendRequestError(e.to_string())),
    };

    if !res.status().is_success() {
       return  Err(LcuFetchError::RequestNotSuccess(
           res.json::<Value>().await.unwrap_or(Value::Null)
        ))
    }

    match res.json::<T>().await {
        Ok(parsed) => Ok(parsed),
        Err(e) => Err(
            LcuFetchError::ResponseDeserializationError(e.to_string())
        )
    }
}
