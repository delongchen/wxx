use std::io::Result;

fn main() -> Result<()> {
    let mut config = prost_build::Config::new();

    config.protoc_executable("./protoc.exe");
    config.out_dir("lib_rs");

    config.type_attribute(".", "#[derive(serde::Serialize, serde::Deserialize)]");
    config.type_attribute(".", "#[serde(rename_all = \"camelCase\")]");

    config.compile_protos(
        &["src_proto/lcu/*.proto", "src_proto/common/*.proto"],
        &["src_proto"],
    )?;

    Ok(())
}
