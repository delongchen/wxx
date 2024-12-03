use crate::v3::errors::{AppInternalError, CommandError, LcuRestError};
use crate::v3::models::app::states::AppState;
use reqwest::header::HeaderValue;
use reqwest::RequestBuilder;
use serde_json::Value;
use std::time::Duration;

pub enum LcuEndpoints {
    SummonerInfo(String),
    GameHistory(String, u32, u32),
    GameDetail(u64),
}

impl LcuEndpoints {
    fn to_string(&self) -> String {
        match self {
            LcuEndpoints::SummonerInfo(puuid) => {
                format!("/lol-summoner/v2/summoners/puuid/{puuid}")
            }
            LcuEndpoints::GameHistory(puuid, beg, end) => {
                format!("/lol-match-history/v1/products/lol/{puuid}/matches?begIndex={beg}&endIndex={end}")
            }
            LcuEndpoints::GameDetail(id) => {
                format!("/lol-match-history/v1/games/{id}")
            }
        }
    }

    pub async fn fetch<T: serde::de::DeserializeOwned>(
        &self,
        fetcher: &impl LcuFetcher,
        timeout_ms: u64,
    ) -> Result<T, CommandError> {
        let result = fetcher
            .lcu_get(&self.to_string(), timeout_ms)
            .await?
            .json::<T>()
            .await
            .map_err(|err| {
                println!("LcuFetcher::lcu_get() error: {:?}", err);
                CommandError::EncodeResultFailed(err.to_string())
            })?;

        Ok(result)
    }
}

pub trait LcuFetcher {
    async fn create_request(
        &self,
        method: &str,
        endpoint: &str,
        body: &Value,
        timeout_ms: u64,
    ) -> Result<RequestBuilder, AppInternalError>;

    async fn lcu_fetch(
        &self,
        method: &str,
        endpoint: &str,
        body: &Value,
        timeout_ms: u64,
    ) -> Result<reqwest::Response, AppInternalError> {
        let request = self
            .create_request(method, endpoint, body, timeout_ms)
            .await?;

        let response = request
            .send()
            .await
            .map_err(|err| LcuRestError::RequestError(err))?;

        Ok(response)
    }

    async fn lcu_get(
        &self,
        endpoint: &str,
        timeout_ms: u64,
    ) -> Result<reqwest::Response, AppInternalError> {
        self.lcu_fetch("get", endpoint, &Value::Null, timeout_ms)
            .await
    }

    async fn lcu_post(
        &self,
        endpoint: &str,
        body: &Value,
        timeout_ms: u64,
    ) -> Result<reqwest::Response, AppInternalError> {
        self.lcu_fetch("post", endpoint, body, timeout_ms).await
    }
}

impl LcuFetcher for AppState {
    async fn create_request(
        &self,
        method: &str,
        endpoint: &str,
        body: &Value,
        timeout_ms: u64,
    ) -> Result<RequestBuilder, AppInternalError> {
        let lcu_process_info = self.need_lcu_process_info().await?;

        let url = format!(
            "https://127.0.0.1:{port}{endpoint}",
            port = lcu_process_info.api_port,
            endpoint = endpoint,
        );

        let mut request = self.rest_client.create_request(method, &url)?;

        request = request.header(
            "Authorization",
            HeaderValue::from_str(format!("Basic {}", lcu_process_info.auth_token).as_str())
                .map_err(|_| LcuRestError::Unknown)?,
        );

        if timeout_ms != 0 {
            request = request.timeout(Duration::from_millis(timeout_ms));
        }

        if let Value::Object(body) = body {
            request = request.json(body);
        };

        Ok(request)
    }
}
