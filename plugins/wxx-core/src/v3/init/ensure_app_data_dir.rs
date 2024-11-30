use serde_json::Value;
use std::path::Path;
use std::{fs, io};

#[derive(Debug, PartialEq)]
enum FileSystemNode {
    File(String),
    Directory(String, Vec<FileSystemNode>),
}

fn try_create(path: &Path, is_file: bool) -> io::Result<()> {
    if !path.exists() {
        if is_file {
            fs::File::create(path).map(|_| ())?
        } else {
            fs::create_dir(path)?
        }
    }

    Ok(())
}

impl FileSystemNode {
    pub fn create_if_not_exist(&self, parent: &Path) -> io::Result<()> {
        match self {
            Self::File(name) => {
                let file_path = parent.join(name);
                try_create(&file_path, true)
            }
            Self::Directory(name, children) => {
                let dir_path = parent.join(name);
                try_create(&dir_path, false)?;
                for child in children {
                    child.create_if_not_exist(&dir_path)?;
                }
                Ok(())
            }
        }
    }

    pub fn from_json(text: &str) -> Vec<FileSystemNode> {
        if let Value::Array(root) = serde_json::from_str(text).unwrap() {
            root.iter().filter_map(parse_path_map).collect::<Vec<_>>()
        } else {
            Vec::new()
        }
    }
}

fn parse_path_map(value: &Value) -> Option<FileSystemNode> {
    match value {
        Value::String(file) => Some(FileSystemNode::File(file.clone())),
        Value::Array(array) if !array.is_empty() => {
            if let Value::String(dir_name) = &array[0] {
                let children = array[1..]
                    .iter()
                    .filter_map(parse_path_map)
                    .collect::<Vec<_>>();
                Some(FileSystemNode::Directory(dir_name.clone(), children))
            } else {
                None
            }
        }
        _ => None,
    }
}

pub async fn ensure(root_path: &Path) -> io::Result<()> {
    for entry in FileSystemNode::from_json(include_str!("../../config/app_data_dirs.json")) {
        entry.create_if_not_exist(root_path)?;
    }

    Ok(())
}
