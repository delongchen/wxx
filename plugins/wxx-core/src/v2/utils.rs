use std::io::ErrorKind;
use std::path::PathBuf;
use std::{fs, io};

pub fn create_dir_if_not_exists_sync(path: &PathBuf) -> io::Result<()> {
    if !path.exists() {
        fs::create_dir_all(path)?;
    }

    Ok(())
}

pub async fn create_dir_if_not_exists(path: &PathBuf) -> io::Result<()> {
    let result = tokio::fs::create_dir_all(path).await;

    if let Err(e) = result {
        if e.kind() != ErrorKind::AlreadyExists {
            return Err(e);
        }
    }

    Ok(())
}
