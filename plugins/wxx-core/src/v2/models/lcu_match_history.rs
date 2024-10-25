use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchHistory {
    pub account_id: u64,
    pub games: Games,
    pub platform_id: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Games {
    pub game_begin_date: String,
    pub game_count: u32,
    pub game_end_date: String,
    pub game_index_begin: u32,
    pub game_index_end: u32,
    pub games: Vec<Game>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Game {
    pub end_of_game_result: String,
    pub game_creation: u64,
    pub game_creation_date: String,
    pub game_duration: u32,
    pub game_id: u64,
    pub game_mode: String,
    pub game_type: String,
    pub game_version: String,
    pub map_id: u32,
    pub participant_identities: Vec<ParticipantIdentity>,
    pub participants: Vec<Participant>,
    pub platform_id: String,
    pub queue_id: u32,
    pub season_id: u32,
    pub teams: Vec<Team>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Team {
    pub bans: Value, // Using Value for any
    pub baron_kills: u32,
    pub dominion_victory_score: u32,
    pub dragon_kills: u32,
    pub first_baron: bool,
    pub first_blood: bool,
    pub first_dargon: bool, // Keeping as is based on your note
    pub first_inhibitor: bool,
    pub first_tower: bool,
    pub inhibitor_kills: u32,
    pub rift_herald_kills: u32,
    pub team_id: u32,
    pub tower_kills: u32,
    pub vilemaw_kills: u32,
    pub win: String, // 'Win' or 'Fail'
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Participant {
    pub champion_id: u32,
    pub highest_achieved_season_tier: String,
    pub participant_id: u32,
    pub spell1_id: u32,
    pub spell2_id: u32,
    pub stats: Stats,
    pub team_id: u32,
    //
    // pub timeline: Timeline,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Timeline {
    pub creeps_per_min_deltas: CreepsPerMinDeltas,
    pub cs_diff_per_min_deltas: CsDiffPerMinDeltas,
    pub damage_taken_diff_per_min_deltas: CsDiffPerMinDeltas,
    pub damage_taken_per_min_deltas: CreepsPerMinDeltas,
    pub gold_per_min_deltas: CreepsPerMinDeltas,
    pub lane: String, // enum "TOP", "JUNGLE", etc.
    pub participant_id: u32,
    pub role: String, // enum "DUO", "SOLO", etc.
    pub xp_diff_per_min_deltas: CsDiffPerMinDeltas,
    pub xp_per_min_deltas: CreepsPerMinDeltas,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CsDiffPerMinDeltas {
    pub deltas: std::collections::HashMap<String, f32>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreepsPerMinDeltas {
    pub deltas: std::collections::HashMap<String, f32>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    pub assists: u32,
    pub caused_early_surrender: bool,
    pub champ_level: u32,
    pub combat_player_score: u32,
    pub damage_dealt_to_objectives: u32,
    pub damage_dealt_to_turrets: u32,
    pub damage_self_mitigated: u32,
    pub deaths: u32,
    pub double_kills: u32,
    pub early_surrender_accomplice: bool,
    pub first_blood_assist: bool,
    pub first_blood_kill: bool,
    pub first_inhibitor_assist: bool,
    pub first_inhibitor_kill: bool,
    pub first_tower_assist: bool,
    pub first_tower_kill: bool,
    pub game_ended_in_early_surrender: bool,
    pub game_ended_in_surrender: bool,
    pub gold_earned: u32,
    pub gold_spent: u32,
    pub inhibitor_kills: u32,
    pub item0: u32,
    pub item1: u32,
    pub item2: u32,
    pub item3: u32,
    pub item4: u32,
    pub item5: u32,
    pub item6: u32,
    pub player_augment1: u32,
    pub player_augment2: u32,
    pub player_augment3: u32,
    pub player_augment4: u32,
    pub player_augment5: u32,
    pub player_augment6: u32,
    pub killing_sprees: u32,
    pub kills: u32,
    pub largest_critical_strike: u32,
    pub largest_killing_spree: u32,
    pub largest_multi_kill: u32,
    pub longest_time_spent_living: u32,
    pub magic_damage_dealt: u32,
    pub magic_damage_dealt_to_champions: u32,
    pub magical_damage_taken: u32,
    pub neutral_minions_killed: u32,
    pub neutral_minions_killed_enemy_jungle: u32,
    pub neutral_minions_killed_team_jungle: u32,
    pub objective_player_score: u32,
    pub participant_id: u32,
    pub penta_kills: u32,
    pub perk0: u32,
    pub perk0_var1: i32,
    pub perk0_var2: i32,
    pub perk0_var3: i32,
    pub perk1: u32,
    pub perk1_var1: i32,
    pub perk1_var2: i32,
    pub perk1_var3: i32,
    pub perk2: u32,
    pub perk2_var1: i32,
    pub perk2_var2: i32,
    pub perk2_var3: i32,
    pub perk3: u32,
    pub perk3_var1: i32,
    pub perk3_var2: i32,
    pub perk3_var3: i32,
    pub perk4: u32,
    pub perk4_var1: i32,
    pub perk4_var2: i32,
    pub perk4_var3: i32,
    pub perk5: u32,
    pub perk5_var1: i32,
    pub perk5_var2: i32,
    pub perk5_var3: i32,
    pub perk_primary_style: u32,
    pub perk_sub_style: u32,
    pub physical_damage_dealt: u32,
    pub physical_damage_dealt_to_champions: u32,
    pub physical_damage_taken: u32,
    pub player_score0: u32,
    pub player_score1: u32,
    pub player_score2: u32,
    pub player_score3: u32,
    pub player_score4: u32,
    pub player_score5: u32,
    pub player_score6: u32,
    pub player_score7: u32,
    pub player_score8: u32,
    pub player_score9: u32,
    pub quadra_kills: u32,
    pub sight_wards_bought_in_game: u32,
    pub subteam_placement: u32,
    pub team_early_surrendered: bool,
    pub time_c_cing_others: u32,
    pub total_damage_dealt: u32,
    pub total_damage_dealt_to_champions: u32,
    pub total_damage_taken: u32,
    pub total_heal: u32,
    pub total_minions_killed: u32,
    pub total_player_score: u32,
    pub total_score_rank: u32,
    pub total_time_crowd_control_dealt: u32,
    pub total_units_healed: u32,
    pub triple_kills: u32,
    pub true_damage_dealt: u32,
    pub true_damage_dealt_to_champions: u32,
    pub true_damage_taken: u32,
    pub turret_kills: u32,
    pub unreal_kills: u32,
    pub vision_score: u32,
    pub vision_wards_bought_in_game: u32,
    pub wards_killed: u32,
    pub wards_placed: u32,
    pub win: bool,
    pub player_subteam_id: u32,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParticipantIdentity {
    pub participant_id: u32,
    pub player: Player,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Player {
    pub account_id: u64,
    pub current_account_id: u64,
    pub current_platform_id: String,
    pub match_history_uri: String,
    pub platform_id: String,
    pub profile_icon: u32,
    pub summoner_id: u64,
    pub puuid: String,
    pub game_name: String,
    pub tag_line: String,
    pub summoner_name: String,
}
