pub fn get_since_the_epoch_ms() -> i64 {
    let now = std::time::SystemTime::now();
    let since_the_epoch_ms = now
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;

    since_the_epoch_ms
}
