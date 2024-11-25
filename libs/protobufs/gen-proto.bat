set "BASE_DIR=%CD%"
set "SORUCE_DIR=%BASE_DIR%\src_proto"

del %BASE_DIR%\lib_js\*

protoc.exe ^
    --proto_path=%SORUCE_DIR% ^
    --plugin=protoc-gen-ts_proto=".\\node_modules\\.bin\\protoc-gen-ts_proto.CMD" ^
    --ts_proto_opt=outputIndex=true ^
    --ts_proto_out=".\\lib_js" ^
    %SORUCE_DIR%\lcu\*.proto ^
    %SORUCE_DIR%\common\*.proto ^
    %SORUCE_DIR%\rest\*.proto

npx tsc
