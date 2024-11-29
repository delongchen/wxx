use crate::consts::RIOT_GAMES_PEM_BYTES;
use crate::v3::errors::LcuRestError;
use std::time::Duration;

fn select_request_method(method: &str) -> Result<reqwest::Method, LcuRestError> {
    match method {
        "get" | "GET" => Ok(reqwest::Method::GET),
        "post" | "POST" => Ok(reqwest::Method::POST),
        "put" | "PUT" => Ok(reqwest::Method::PUT),
        "delete" | "DELETE" => Ok(reqwest::Method::DELETE),
        _ => Err(LcuRestError::MethodNotAllowed(method.to_string())),
    }
}

pub struct LcuRestClient(reqwest::Client);

impl LcuRestClient {
    pub fn new() -> Self {
        let certificate = reqwest::Certificate::from_pem(RIOT_GAMES_PEM_BYTES).unwrap();

        let client = reqwest::Client::builder()
            .add_root_certificate(certificate)
            .timeout(Duration::from_secs(20))
            .build()
            .unwrap();

        Self(client)
    }

    pub fn create_request(
        &self,
        method: &str,
        url: &str,
    ) -> Result<reqwest::RequestBuilder, LcuRestError> {
        let method = select_request_method(method)?;
        let url =
            reqwest::Url::parse(url).map_err(|_| LcuRestError::IllegalEndpoint(url.to_string()))?;

        Ok(self.0.request(method, url))
    }
}
