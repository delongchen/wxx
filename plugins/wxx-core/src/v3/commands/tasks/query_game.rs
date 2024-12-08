use crate::v3::errors::CommandError;
use super::db_helper::LcuDbHelper;
use crate::v3::models::db::WxxSqlite;
use super::models::GameRecord;

async fn query_games_by_puuid(db: &WxxSqlite, puuid: &str) -> Result<Vec<GameRecord>, CommandError> {
    let games = db.query_games_by_puuid(puuid).await?;
    
    Ok(games)
}

async fn query_game() {
    
}