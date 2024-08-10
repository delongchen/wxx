use std::time::Duration;
use reqwest::{Certificate, ClientBuilder, RequestBuilder};
use reqwest::header::HeaderValue;
use serde_json::Value;
use crate::v2::consts::RIOT_GAMES_PEM_BYTES;

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
    fn from(raw: String) -> Option<Self> {
        match raw.as_str() {
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
            .timeout(Duration::from_millis(500))
            .build()
            .unwrap();

        Self {
            client
        }
    }

    pub fn create_request(
        &self,
        method: String,
        endpoint: String,
        body: Value,
        port: String,
        auth_token: String,
    ) -> Result<RequestBuilder, LcuRestError> {
        let method = {
            match LcuRestAllowMethod::from(method) {
                None => {
                    return Err(LcuRestError::MethodNotAllow)
                }
                Some(method) => method
            }
        };

        let url = format!("https://127.0.0.1:{}{}", port, endpoint);

        let req = match method {
            LcuRestAllowMethod::GET => self.client.get(url),
            LcuRestAllowMethod::DELETE => self.client.delete(url),
            LcuRestAllowMethod::POST => {
                let req = self.client.post(url);
                match body {
                    Value::Object(body) => req.json(&body),
                    _ => req
                }
            },
            LcuRestAllowMethod::PUT => {
                let req = self.client.put(url);
                match body {
                    Value::Object(body) => req.json(&body),
                    _ => req
                }
            },
        };

        let req = req.header(
            "Authorization",
            HeaderValue::from_str(
                format!("Basic {}", auth_token).as_str()
            ).unwrap(),
        );

        Ok(req)
    }
}
