use crate::v2::utils::create_dir_if_not_exists_sync;
use std::ops::Add;
use std::path::PathBuf;

const MAIN_DIR: &str = "wxsb";
const CONFIG_DIR: &str = "configs";

enum ConfigFileType {
    JSON,
    YAML,
    TOML,
}

impl ConfigFileType {
    fn from_string(raw: String) -> Self {
        match raw.as_str() {
            "json" => Self::JSON,
            "yaml" => Self::YAML,
            "toml" => Self::TOML,
            _ => Self::JSON,
        }
    }

    fn with_filename(&self, name: String) -> String {
        let suffix = match self {
            Self::JSON => ".json",
            Self::YAML => ".yaml",
            Self::TOML => ".toml",
        };

        name.add(suffix)
    }
}

pub fn resolve_config_file(
    mut data_path: PathBuf,
    namespace: String,
    config_name: String,
    config_type: String,
) -> PathBuf {
    let config_type = ConfigFileType::from_string(config_type);

    data_path.push(MAIN_DIR);
    data_path.push(CONFIG_DIR);
    data_path.push(namespace);

    create_dir_if_not_exists_sync(&data_path).expect("create error");

    data_path.push(config_type.with_filename(config_name));

    data_path
}
