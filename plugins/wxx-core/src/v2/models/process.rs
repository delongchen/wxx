#[derive(PartialEq, Debug, Clone)]
pub enum LcuProcessStatus {
    NotStarted,
    NotStartedWithAdmin,
    Started(LcuProcessInfo),
}

#[derive(PartialEq, Debug, Clone)]
pub struct LcuProcessInfo {
    pub port: String,
    pub auth_token: String,
}
