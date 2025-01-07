use crate::v3::errors::CommandError;
use crate::v3::models::app::states::AppState;
use crate::v3::utils::LcuEndpoints;
use wxx_protobuf::lcu::summoner::SummonerBaseInfo;

pub async fn fetch_summoner(
    fetcher: &AppState,
    puuid: &str,
) -> Result<SummonerBaseInfo, CommandError> {
    let summoner = LcuEndpoints::SummonerInfo(puuid.to_string())
        .fetch::<SummonerBaseInfo>(fetcher, 0)
        .await?;

    Ok(summoner)
}
