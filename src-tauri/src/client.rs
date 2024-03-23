// use serde_json::Value;
// use shaco::rest::RESTClient;

// const CURRENT_SUMMONER_ENDPOINT: &str = "/lol-summoner/v1/current-summoner";
// const LIST_GAME_BY_SUMMONER_ENDPOINT: &str = "/lol-match-history/v3/matchlist/account/";
// const LIST_GAME_BY_PUUID_ENDPOINT: &str = "/lol-match-history/v1/products/lol/";
// pub struct LolApiClient {
//     client: RESTClient,
// }

// impl LolApiClient {
//     pub fn new() -> Self {
//         Self {
//             client: RESTClient::new().expect("should initial client"),
//         }
//     }

//     pub async fn get_current_summoner(&self) -> Value {
//         self.client
//             .get(CURRENT_SUMMONER_ENDPOINT.to_string())
//             .await
//             .expect("should return")
//     }

//     pub async fn list_games_by_summoner_id(
//         &self,
//         summoner_id: i64,
//         start: i32,
//         limit: i32,
//     ) -> Value {
//         let endpoint: String = format!(
//             "{}{}?begIndex={}endIndex={}",
//             LIST_GAME_BY_SUMMONER_ENDPOINT,
//             summoner_id,
//             start,
//             start + limit
//         );
//         self.client.get(endpoint).await.expect("should return")
//     }

//     pub async fn list_games_by_puuid(&self, puuid: String, start: i32, limit: i32) -> Value {
//         let endpoint = format!(
//             "{}{}/matches?begIndex={}endIndex={}",
//             LIST_GAME_BY_PUUID_ENDPOINT,
//             puuid,
//             start,
//             start + limit
//         );
//         self.client.get(endpoint).await.expect("should return")
//     }
// }

use serde_json::Value;
use shaco::rest::RESTClient;
use tauri::State;

pub struct LolApiClient {
    client: RESTClient,
}

impl LolApiClient {
    pub fn new() -> Self {
        Self {
            client: RESTClient::new().expect("should initial client"),
        }
    }

    pub async fn send_get_request(&self, endpoint: String) -> Result<Value, String> {
        self.client
            .get(endpoint)
            .await
            .map_err(|e| format!("Failed to send request: {}", e))
    }

    pub async fn send_post_request(&self, endpoint: String, body: Value) -> Result<Value, String> {
        self.client
            .post(endpoint, body)
            .await
            .map_err(|e| format!("Failed to send request: {}", e))
    }
}

#[tauri::command]
pub async fn handle_get_request(
    state: State<'_, LolApiClient>,
    endpoint: String,
) -> Result<Value, String> {
    state.send_get_request(endpoint).await
}

#[tauri::command]
pub async fn handle_post_request(
    state: State<'_, LolApiClient>,
    endpoint: String,
    body: Value,
) -> Result<Value, String> {
    state.send_post_request(endpoint, body).await
}
