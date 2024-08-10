#[derive(PartialEq, Debug, Clone)]
pub enum LcuProcessStatus {
    NotStarted,
    NotStartedWithAdmin,
    Started(LcuProcessInfo),
}

impl LcuProcessStatus {
    pub fn as_code(&self) -> u8 {
        match self {
            LcuProcessStatus::NotStarted => 1,
            LcuProcessStatus::NotStartedWithAdmin => 2,
            LcuProcessStatus::Started(_) => 3,
        }
    }
}

#[derive(PartialEq, Debug, Clone)]
pub struct LcuProcessInfo {
    pub port: String,
    pub auth_token: String,
}
