use serde_json::{Map, to_string_pretty, Value};
use tauri::{AppHandle, command, Manager, Runtime};
use crate::v2::config_manager::resolve_config_file;


type AnyObject = Map<String, Value>;

fn merge_object(
    target: AnyObject,
    source: AnyObject,
) -> AnyObject {
    let mut result = target;

    for (key, value) in source {
        result.insert(key, value);
    }

    result
}

#[command]
pub async fn read_config<R: Runtime>(
    app_handle: AppHandle<R>,
    namespace: String,
    config_name: String,
    config_type: String,
) -> Result<AnyObject, String> {
    let data_path = app_handle
        .path()
        .data_dir()
        .map_err(|_| "create data_path error".to_string())?;

    let file_path = resolve_config_file(
        data_path,
        namespace,
        config_name,
        config_type,
    );

    if !file_path.exists() {
        return Err("not found".to_string())
    }

    let config_text = tokio::fs::read_to_string(file_path)
        .await
        .map_err(|_| "read error".to_string())?;

    let config_data = serde_json::from_str::<AnyObject>(&config_text)
        .map_err(|_| "parse error".to_string())?;

    Ok(config_data)
}

#[command]
pub async fn write_config<R: Runtime>(
    app_handle: AppHandle<R>,
    namespace: String,
    config_name: String,
    config_type: String,
    data: Value,
) -> Result<Value, String> {
    let mut data = match data {
        Value::Object(data) => data,
        _ => {
            return Err("data is not object".to_string())
        }
    };

    let data_path = app_handle
        .path()
        .data_dir()
        .map_err(|_| "create data_path error".to_string())?;

    let file_path = resolve_config_file(
        data_path,
        namespace,
        config_name,
        config_type,
    );

    if file_path.exists() {
        let config_text = tokio::fs::read_to_string(&file_path)
            .await
            .map_err(|_| "read error".to_string())?;

        let prev_data = serde_json::from_str::<AnyObject>(
            &config_text
        ).map_err(|_| "parse error".to_string())?;

        data = merge_object(prev_data, data);
    }

    let data = Value::Object(data);

    let json_text = to_string_pretty(&data)
        .map_err(|_| "json to string error".to_string())?;

    tokio::fs::write(
        file_path,
        json_text,
    ).await
        .map_err(|_| "write file error".to_string())?;

    Ok(data)
}
