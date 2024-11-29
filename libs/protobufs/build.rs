use std::io::Result;

fn main() -> Result<()> {
    let mut config = prost_build::Config::new();

    config.protoc_executable("./protoc.exe");
    config.out_dir("lib_rs/lcu");

    config.type_attribute(".", "#[derive(serde::Serialize, serde::Deserialize)]");

    config.compile_protos(&["src_proto/lcu/match-history.proto"], &["src_proto"])?;

    Ok(())
}
