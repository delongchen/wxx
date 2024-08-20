set BASE_DIR=C:\Users\cdlfg\RustroverProjects\lol_helper\app\protobufs\src

protoc ^
    --proto_path=%BASE_DIR% ^
    --plugin=protoc-gen-ts_proto=".\\node_modules\\.bin\\protoc-gen-ts_proto.cmd" ^
    --ts_proto_out=".\\lib" ^
    %BASE_DIR%\lcu\*.proto ^
    %BASE_DIR%\common\*.proto