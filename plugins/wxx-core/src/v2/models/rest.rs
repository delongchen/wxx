use crate::v2::consts::RIOT_GAMES_PEM_BYTES;
use crate::v2::errors::lcu_fetch_error::LcuFetchError;
use reqwest::header::HeaderValue;
use reqwest::{Certificate, ClientBuilder, RequestBuilder};
use serde::de::DeserializeOwned;
use serde_json::Value;
use std::time::Duration;

const DEFAULT_TIMEOUT_MILLIS: u64 = 20000;

pub enum LcuRestError {
    MethodNotAllow,
}

enum LcuRestAllowMethod {
    GET,
    POST,
    PUT,
    DELETE,
}

impl LcuRestAllowMethod {
    fn from(raw: &str) -> Option<Self> {
        match raw {
            "get" | "GET" => Some(Self::GET),
            "post" | "POST" => Some(Self::POST),
            "put" | "PUT" => Some(Self::PUT),
            "delete" | "DELETE" => Some(Self::DELETE),
            _ => None,
        }
    }
}

pub struct LcuRestClient {
    client: reqwest::Client,
}

impl LcuRestClient {
    pub fn new() -> Self {
        let cert = Certificate::from_pem(RIOT_GAMES_PEM_BYTES).unwrap();

        let client = ClientBuilder::new()
            .add_root_certificate(cert)
            .build()
            .unwrap();

        Self { client }
    }

    pub fn create_request(
        &self,
        method: &str,
        endpoint: &str,
        body: &Value,
        port: &str,
        auth_token: &str,
        timeout: u64,
    ) -> Result<RequestBuilder, LcuRestError> {
        let method = {
            match LcuRestAllowMethod::from(method) {
                None => return Err(LcuRestError::MethodNotAllow),
                Some(method) => method,
            }
        };

        let url = format!("https://127.0.0.1:{}{}", port, endpoint);

        let req = match method {
            LcuRestAllowMethod::GET => self.client.get(url),
            LcuRestAllowMethod::DELETE => self.client.delete(url),
            LcuRestAllowMethod::POST => {
                let req = self.client.post(url);
                match body {
                    Value::Object(body) => req.json(body),
                    _ => req,
                }
            }
            LcuRestAllowMethod::PUT => {
                let req = self.client.put(url);
                match body {
                    Value::Object(body) => req.json(body),
                    _ => req,
                }
            }
        };

        let req = req.header(
            "Authorization",
            HeaderValue::from_str(format!("Basic {}", auth_token).as_str()).unwrap(),
        );

        let timeout_millis = Duration::from_millis(
            if timeout <= 0 { DEFAULT_TIMEOUT_MILLIS } else { timeout }
        );

        Ok(req.timeout(timeout_millis))
    }
}

pub struct LcuFetcher<'this> {
    client: &'this LcuRestClient,
    port: &'this str,
    auth_token: &'this str,
}

impl<'this> LcuFetcher<'this> {
    pub fn of(client: &'this LcuRestClient, port: &'this str, auth_token: &'this str) -> Self {
        LcuFetcher {
            client,
            port,
            auth_token,
        }
    }

    pub async fn fetch<T: DeserializeOwned>(
        &self,
        method: &str,
        endpoint: String,
        timeout: u64,
        body: &Value,
    ) -> Result<T, LcuFetchError> {
        let req = self
            .client
            .create_request(method, &endpoint, body, self.port, self.auth_token, timeout)
            .map_err(|_| LcuFetchError::CreateRequestError)?;

        let res = match req.send().await {
            Ok(res) => res,
            Err(e) => return Err(LcuFetchError::SendRequestError(e.to_string())),
        };

        if !res.status().is_success() {
            return Err(LcuFetchError::RequestNotSuccess(
                res.json::<Value>().await.unwrap_or(Value::Null),
            ));
        }

        match res.json::<T>().await {
            Ok(parsed) => Ok(parsed),
            Err(e) => Err(LcuFetchError::ResponseDeserializationError(e.to_string())),
        }
    }

    pub async fn fetch_without_payload<T: DeserializeOwned>(
        &self,
        endpoint: String,
        timeout: u64,
    ) -> Result<T, LcuFetchError> {
        self.fetch::<T>("get", endpoint, timeout, &Value::Null)
            .await
    }
}
