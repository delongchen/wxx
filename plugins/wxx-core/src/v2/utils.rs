use std::path::PathBuf;
use std::{fs, io};

pub fn create_dir_if_not_exists(path: &PathBuf) -> io::Result<()> {
    if !path.exists() {
        fs::create_dir_all(path)?;
    }

    Ok(())
}
