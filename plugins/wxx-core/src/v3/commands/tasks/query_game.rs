use super::db_helper::LcuDbHelper;
use crate::v3::errors::CommandError;
use crate::v3::models::db::WxxSqlite;
use prost::Message;
use tauri::State;
use wxx_protobuf::common::BytesList;
use wxx_protobuf::lcu::summoner::SummonerBaseInfo;

async fn query_games_by_puuid(db: &WxxSqlite, puuid: &str) -> Result<Vec<u8>, CommandError> {
    let data = db
        .query_games_by_puuid(puuid)
        .await?
        .into_iter()
        .map(|it| it.body)
        .collect::<Vec<_>>();

    Ok(BytesList { data }.encode_to_vec())
}

#[tauri::command]
pub async fn query_game(
    db: State<'_, WxxSqlite>,
    puuid: String,
) -> Result<tauri::ipc::Response, CommandError> {
    let result = query_games_by_puuid(&db, &puuid).await?;

    Ok(tauri::ipc::Response::new(result))
}

#[derive(serde::Serialize)]
pub struct SummonerQueryEntry {
    summoner: SummonerBaseInfo,
    latest_sync: i64,
}

#[tauri::command]
pub async fn query_summoners(
    db: State<'_, WxxSqlite>,
    action: String,
    puuid: String,
    full_updated: bool,
) -> Result<Option<Vec<SummonerQueryEntry>>, CommandError> {
    match action.as_str() {
        "get" => {
            let records = db.fetch_summoners(full_updated).await?;
            Ok(Some(
                records
                    .iter()
                    .map(|item| SummonerQueryEntry {
                        summoner: SummonerBaseInfo::decode(item.body.as_slice()).unwrap(),
                        latest_sync: item.latest_sync,
                    })
                    .collect(),
            ))
        }
        "del" => {
            db.delete_summoner(&puuid).await?;
            Ok(None)
        }
        _ => Ok(None),
    }
}
