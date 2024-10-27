use std::path::PathBuf;
use crate::v2::app_states::AppState;
use crate::v2::commands::utils::{need_app_data_dir, need_lcu_process_info};
use crate::v2::consts::{dir_names::SUMMONER_DATA_DIR_NAME, events::LCU_MATCH_HISTORY_TASK};
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use crate::v2::models::lcu_match_history::{Game, MatchHistory};
use crate::v2::models::rest::LcuFetcher;
use crate::v2::utils::create_dir_if_not_exists;
use serde::Serialize;
use serde_json::{json, Value};
use tauri::{command, AppHandle, Emitter, Runtime, State};
use tokio::fs::OpenOptions;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt};

const HISTORY_WINDOW_WIDTH_WIDE: u32 = 200;
const HISTORY_WINDOW_WIDTH_NARROW: u32 = 20;

const MATCH_INDEX_FILE_NAME: &str = "match_history_index";
const MATCH_CACHE_FILE_NAME: &str = "match_history_cache";
const GAME_MODE_ARAM: &str = "ARAM";
const GAME_TYPE_MATCHED: &str = "MATCHED_GAME";
const GAME_END_OF_COMPLETE: &str = "GameComplete";

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

type OpenOptionFn = fn(options: &mut OpenOptions);

async fn open_file_with_option(file_path: PathBuf, option: OpenOptionFn) -> tokio::io::Result<tokio::fs::File> {
    let mut options = OpenOptions::new();
    option(&mut options);
    options
        .open(file_path)
        .await
}

async fn read_local_matches_index(summoner_dir_path: &PathBuf) -> tokio::io::Result<Vec<(u64, u64)>> {
    let file = open_file_with_option(
        summoner_dir_path.join(MATCH_INDEX_FILE_NAME),
        |options| {
            options.read(true).create(true);
        },
    ).await?;
    
    let reader = tokio::io::BufReader::new(file);
    let mut lines = reader.lines();

    let mut match_history_vec: Vec<(u64, u64)> = vec![];
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
    puuid: String,
) -> Result<Value, LcuFetchError> {
    // before fetching data, lcu must be started
    let process_info = need_lcu_process_info(&state)
        .await
        .map_err(|_| LcuFetchError::LcuNotStarted)?;

    // create an api-helper
    let fetcher = LcuFetcher::of(
        &state.rest_client,
        &process_info.port,
        &process_info.auth_token,
    );

    // create emitter
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

    // path: {APP_DATA_PATH}/wxsb/summoners/{puuid}
    let summoner_data_dir_path = {
        let summoner_dir = need_app_data_dir(&app_handle)
            .join(SUMMONER_DATA_DIR_NAME)
            .join(&puuid);

        // prepare the dir
        create_dir_if_not_exists(&summoner_dir).await.unwrap();
        
        summoner_dir
    };

    let matches_to_fetch = {
        // [stage: start task]
        emit_fetch_stage(FetchMatchHistoryStage::StartTask, json!({}));
        
        let matches_index = read_local_matches_index(&summoner_data_dir_path)
            .await
            .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

        let index_fetch_width = if matches_index.len() == 0 {
            HISTORY_WINDOW_WIDTH_WIDE
        } else {
            HISTORY_WINDOW_WIDTH_NARROW
        };
        
        let mut beg_index = 0;
        let mut error_count = 0;
        let mut matches_to_fetch: Vec<(u64, u64)> = vec![];
        let latest_creation: u64 = if matches_index.len() == 0 {
            0
        } else {
            matches_index.last().unwrap().1
        };

        'outer: loop {
            // [stage: scanning index] tell front-end the info about scanning
            emit_fetch_stage(
                FetchMatchHistoryStage::ScanningIndex,
                json!({
                    "begIndex": beg_index,
                    "endIndex": beg_index + index_fetch_width - 1,
                }),
            );
            
            let matches_index_chunk = fetcher.fetch_without_payload::<MatchHistory>(
                format!(
                    "/lol-match-history/v1/products/lol/{puuid}/matches?begIndex={beg}&endIndex={end}",
                    puuid = &puuid,
                    beg = beg_index,
                    end = beg_index + index_fetch_width - 1,
                ),
                10000 + error_count * 5000,
            ).await;
            
            if let Ok(res) = matches_index_chunk {
                // once the fetching successful, clean the error counter
                error_count = 0;

                for game in &res.games.games {
                    if game.game_mode == GAME_MODE_ARAM
                        && game.game_type == GAME_TYPE_MATCHED
                        && game.end_of_game_result == GAME_END_OF_COMPLETE
                    {
                        // scanning match history, the list of game creation is arranged 
                        // from largest to smallest.
                        // when creation smaller than latest creation that we recorded last time
                        // end this task.
                        if game.game_creation <= latest_creation {
                            break 'outer;
                        }

                        matches_to_fetch.push((game.game_id, game.game_creation));
                    }
                }

                // When the quantity returned is less than the quantity we expected, 
                // it means there are no more indexes to fetch.
                if res.games.game_count < index_fetch_width {
                    break;
                }

                beg_index += index_fetch_width;
            } else {
                // every fetching task has 3 retry opportunities
                if error_count > 3 {
                    emit_fetch_stage(FetchMatchHistoryStage::EndTask, json!({ "ok": false }));
                    return Err(LcuFetchError::RequestNotSuccess(json!({})));
                }

                error_count += 1;
            }
        }

        let updated_matches_len = matches_to_fetch.len();

        // if there are no matches to fetch, end task.
        if updated_matches_len == 0 {
            emit_fetch_stage(FetchMatchHistoryStage::EndTask, json!({ "ok": true }));
            return Ok(json!({}));
        }
        
        emit_fetch_stage(
            FetchMatchHistoryStage::ScannedIndex,
            json!({ "indexCount": updated_matches_len }),
        );
        
        // since we store matches data from small to large, we need to reverse this list
        matches_to_fetch.sort_by(|a, b| a.1.cmp(&b.1));
        
        matches_to_fetch
    };

    // do fetch game detail here
    let (matches_index, matches_cache) = {
        emit_fetch_stage(
            FetchMatchHistoryStage::FetchingMatchDetail,
            json!({ "indexCount": matches_to_fetch.len() }),
        );
        
        let mut match_cache_buffer = String::new();
        let mut match_index_buffer = String::new();
        let mut matches_fetched_count = 0;
        
        for (game_id, _) in &matches_to_fetch {
            let game_detail_req_url =
                format!("/lol-match-history/v1/games/{game_id}", game_id = game_id);
            let game_detail_req = fetcher.fetch_without_payload::<Game>(game_detail_req_url, 2000);
            let res = game_detail_req.await?;

            match_cache_buffer.push_str(&serde_json::to_string(&res).unwrap());
            match_cache_buffer.push('\n');

            match_index_buffer.push_str(&format!("{},{}\n", res.game_id, res.game_creation));

            matches_fetched_count += 1;
            
            // report front-end every 20 successful fetching
            if matches_fetched_count == 20 {
                emit_fetch_stage(
                    FetchMatchHistoryStage::FetchedMatchDetail,
                    json!({ "fetched": matches_fetched_count }),
                );
                matches_fetched_count = 0;
            }
        }

        (match_index_buffer, match_cache_buffer)
    };

    // todo: refactor this shit block
    // last stage: write fetched data
    {
        let append_mod = |file_name: &str| {
            open_file_with_option(
                summoner_data_dir_path.join(file_name),
                |options| {
                    options.create(true).append(true);
                }
            )
        };
        
        append_mod(MATCH_CACHE_FILE_NAME)
            .await
            .map_err(|err| LcuFetchError::FsError(err.to_string()))?
            .write_all(matches_cache.as_bytes())
            .await
            .unwrap();
        
        append_mod(MATCH_INDEX_FILE_NAME)
            .await
            .map_err(|err| LcuFetchError::FsError(err.to_string()))?
            .write_all(matches_index.as_bytes())
            .await
            .unwrap();
        
        emit_fetch_stage(FetchMatchHistoryStage::EndTask, json!({ "ok": true }));
    };

    Ok(json!({}))
}
