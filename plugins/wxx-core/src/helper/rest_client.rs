use std::time::Duration;
use crate::helper::cert::CERT_BYTES;

pub struct WxxRestClient(reqwest::Client);

impl WxxRestClient {
    pub fn new() -> Self {
        let cert = reqwest::Certificate::from_pem(CERT_BYTES).unwrap();
        let client = reqwest::Client::builder()
            .add_root_certificate(cert)
            .timeout(Duration::from_millis(500))
            .build()
            .unwrap();

        Self(client)
    }

    pub fn get(&self) {

    }
}
