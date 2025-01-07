use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SummonerInfo {
    pub unnamed: bool,
    pub name_change_flag: bool,
    pub account_id: u64,
    pub percent_complete_for_next_level: f32,
    pub profile_icon_id: u32,
    pub summoner_id: u64,
    pub summoner_level: u32,
    pub xp_since_last_level: u32,
    pub xp_until_next_level: u32,
    pub display_name: String,
    pub game_name: String,
    pub internal_name: String,
    pub puuid: String,
    pub tag_line: String,
}
