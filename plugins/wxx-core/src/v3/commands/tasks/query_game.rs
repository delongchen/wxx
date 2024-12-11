use super::db_helper::LcuDbHelper;
use crate::v3::errors::CommandError;
use crate::v3::models::db::WxxSqlite;
use prost::Message;
use tauri::State;
use wxx_protobuf::common::BytesList;

async fn query_games_by_puuid(db: &WxxSqlite, puuid: &str) -> Result<Vec<u8>, CommandError> {
    let data = db
        .query_games_by_puuid(puuid)
        .await?
        .into_iter()
        .map(|it| it.body)
        .collect::<Vec<_>>();

    Ok(BytesList { data }.encode_to_vec())
}

async fn query_full_updated_summoners(db: &WxxSqlite) -> Result<Vec<u8>, CommandError> {
    let data = db
        .query_available_summoners()
        .await?
        .into_iter()
        .map(|item| item.body)
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

#[tauri::command]
pub async fn query_summoners(
    db: State<'_, WxxSqlite>,
) -> Result<tauri::ipc::Response, CommandError> {
    Ok(tauri::ipc::Response::new(
        query_full_updated_summoners(&db).await?,
    ))
}
