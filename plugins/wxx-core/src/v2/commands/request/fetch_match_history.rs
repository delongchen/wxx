use crate::v3::models::app::states::AppState;
use crate::v2::commands::users::summoner::record_summoner_into_local;
use crate::v2::commands::utils::need_app_data_dir;
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use crate::v2::models::lcu_match_history::{Game, MatchHistory};
use crate::v2::models::lcu_summoner_info::SummonerInfo;
use crate::v2::utils::create_dir_if_not_exists;
use serde::Serialize;
use serde_json::{json, Value};
use std::path::PathBuf;
use tauri::{command, AppHandle, Emitter, Runtime, State};
use tokio::fs::OpenOptions;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt};
use crate::consts::dir_names::{MATCH_CACHE_FILE_NAME, MATCH_INDEX_FILE_NAME, SUMMONER_DATA_DIR_NAME};
use crate::consts::events::LCU_MATCH_HISTORY_TASK;

const HISTORY_WINDOW_WIDTH_WIDE: u32 = 200;
const HISTORY_WINDOW_WIDTH_NARROW: u32 = 20;
const MAX_RETRIES: u32 = 3;

const GAME_MODE_ARAM: &str = "ARAM";
const GAME_TYPE_MATCHED: &str = "MATCHED_GAME";
const GAME_END_OF_COMPLETE: &str = "GameComplete";

#[derive(Serialize, Clone)]
#[repr(u8)]
enum FetchMatchHistoryStage {
    StartTask = 0,
    FetchedSummoner,
    ScanningIndex,
    ScannedIndex,
    FetchingMatchDetail,
    FetchedMatchDetail,
    EndTask,
}

#[derive(Serialize, Clone)]
struct FetchMatchHistoryEvent<T: Serialize + Clone> {
    pub puuid: String,
    pub stage: FetchMatchHistoryStage,
    pub data: T,
}

type OpenOptionFn = fn(options: &mut OpenOptions);

async fn open_file_with_option(
    file_path: PathBuf,
    option: OpenOptionFn,
) -> Result<tokio::fs::File, LcuFetchError> {
    let mut options = OpenOptions::new();
    option(&mut options);
    let file = options
        .open(file_path)
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

    Ok(file)
}

async fn append_content(file_path: PathBuf, content: String) -> Result<(), LcuFetchError> {
    let mut file = open_file_with_option(file_path, |options| {
        options.create(true).append(true);
    })
    .await?;

    file.write_all(content.as_bytes())
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

    Ok(())
}

async fn read_local_matches_index(
    summoner_dir_path: &PathBuf,
) -> Result<Vec<(u64, u64)>, LcuFetchError> {
    let file = open_file_with_option(summoner_dir_path.join(MATCH_INDEX_FILE_NAME), |options| {
        options.create(true).read(true).append(true);
    })
    .await?;

    let reader = tokio::io::BufReader::new(file);
    let mut lines = reader.lines();

    let mut match_history_vec: Vec<(u64, u64)> = vec![];
    while let Some(line) = lines
        .next_line()
        .await
        .map_err(|err| LcuFetchError::FsError(err.to_string()))?
    {
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

struct StageEmitter<'cmd, R: Runtime> {
    app_handle: &'cmd AppHandle<R>,
    puuid: &'cmd str,
}

impl<'cmd, R: Runtime> StageEmitter<'cmd, R> {
    fn new(app_handle: &'cmd AppHandle<R>, puuid: &'cmd str) -> Self {
        Self { app_handle, puuid }
    }

    fn stage<T: Serialize + Clone>(&self, stage: FetchMatchHistoryStage, data: T) {
        self.app_handle
            .emit(
                LCU_MATCH_HISTORY_TASK,
                FetchMatchHistoryEvent {
                    puuid: self.puuid.to_string(),
                    stage,
                    data,
                },
            )
            .unwrap();
    }
}

//
#[command]
pub async fn fetch_match_history<R: Runtime>(
    app_handle: AppHandle<R>,
    state: State<'_, AppState>,
    puuid: String,
) -> Result<Value, LcuFetchError> {
    let emitter = StageEmitter::new(&app_handle, &puuid);

    emitter.stage(FetchMatchHistoryStage::StartTask, Value::Null);

    // create an api-helper
    let fetcher = state
        .get_fetcher()
        .await
        .ok_or(LcuFetchError::LcuNotStarted)?;

    let app_data_dir_path = need_app_data_dir(&app_handle);
    // path: {APP_DATA_PATH}/wxsb/summoners/{puuid}
    let summoner_data_dir_path = {
        let summoner_dir = app_data_dir_path.join(SUMMONER_DATA_DIR_NAME).join(&puuid);

        // prepare the dir
        create_dir_if_not_exists(&summoner_dir).await.unwrap();

        summoner_dir
    };

    {
        let summoner_info = fetcher
            .fetch_without_payload::<SummonerInfo>(
                format!("/lol-summoner/v2/summoners/puuid/{puuid}", puuid = &puuid),
                2000,
            )
            .await?;

        record_summoner_into_local(app_data_dir_path, &summoner_info)
            .await
            .map_err(|err| LcuFetchError::FsError(err.to_string()))?;

        emitter.stage(FetchMatchHistoryStage::FetchedSummoner, summoner_info);
    };

    let matches_to_fetch = {
        let matches_index = read_local_matches_index(&summoner_data_dir_path).await?;

        let index_fetch_width = if matches_index.len() == 0 {
            HISTORY_WINDOW_WIDTH_WIDE
        } else {
            HISTORY_WINDOW_WIDTH_NARROW
        };

        let mut beg_index = 0;
        let mut error_count: u32 = 0;
        let mut matches_to_fetch: Vec<(u64, u64)> = vec![];
        let latest_creation: u64 = if matches_index.len() == 0 {
            0
        } else {
            matches_index.last().unwrap().1
        };

        'outer: loop {
            // [stage: scanning index] tell front-end the info about scanning
            emitter.stage(
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
                (10000 + error_count * 5000) as u64,
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
                if error_count > MAX_RETRIES {
                    emitter.stage(FetchMatchHistoryStage::EndTask, json!({ "ok": false }));
                    return Err(LcuFetchError::RequestNotSuccess(json!({})));
                }

                error_count += 1;
            }
        }

        let updated_matches_len = matches_to_fetch.len();

        // if there are no matches to fetch, end task.
        if updated_matches_len == 0 {
            emitter.stage(FetchMatchHistoryStage::EndTask, json!({ "ok": true }));
            return Ok(json!({}));
        }

        emitter.stage(
            FetchMatchHistoryStage::ScannedIndex,
            json!({ "indexCount": updated_matches_len }),
        );

        // since we store matches data from small to large, we need to reverse this list
        matches_to_fetch.sort_by(|a, b| a.1.cmp(&b.1));

        matches_to_fetch
    };

    // do fetch game detail here
    let (matches_index, matches_cache) = {
        // TODO
        // can not tell different between stage `FetchingMatchDetail` and `ScannedIndex`
        // it should be refactored
        emitter.stage(
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
                emitter.stage(
                    FetchMatchHistoryStage::FetchedMatchDetail,
                    json!({ "fetched": matches_fetched_count }),
                );
                matches_fetched_count = 0;
            }
        }

        (match_index_buffer, match_cache_buffer)
    };

    // last stage: save fetched data
    {
        append_content(
            summoner_data_dir_path.join(MATCH_CACHE_FILE_NAME),
            matches_cache,
        )
        .await?;

        append_content(
            summoner_data_dir_path.join(MATCH_INDEX_FILE_NAME),
            matches_index,
        )
        .await?;

        emitter.stage(FetchMatchHistoryStage::EndTask, json!({ "ok": true }));
    };

    Ok(json!({}))
}
