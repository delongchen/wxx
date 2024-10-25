pub enum AppCmdError {
    LcuProcessNotStarted,
}

pub type AppCmdResult<T> = Result<T, AppCmdError>;

impl AppCmdError {
    pub fn to_str(&self) -> &'static str {
        match self {
            AppCmdError::LcuProcessNotStarted => "LcuProcessNotStarted",
        }
    }
}
