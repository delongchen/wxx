const H_MS: i64 = 60 * 60 * 1000;
pub const MAX_SAFE_EXCEPTED_GAME_COUNT: u32 = 200;
pub const GOOD_EXCEPTED_GAME_COUNT: u32 = 10;

pub fn get_since_the_epoch_ms() -> i64 {
    let now = std::time::SystemTime::now();
    let since_the_epoch_ms = now
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;

    since_the_epoch_ms
}

pub fn select_excepted_game_count(last_sync_time_ms: i64, full_update: bool) -> u32 {
    if last_sync_time_ms <= 0 || full_update {
        return MAX_SAFE_EXCEPTED_GAME_COUNT;
    }

    let since_last_sync_ms = get_since_the_epoch_ms() - last_sync_time_ms;
    let since_last_sync_h = (since_last_sync_ms / H_MS) as u32;

    match since_last_sync_h {
        0..GOOD_EXCEPTED_GAME_COUNT => GOOD_EXCEPTED_GAME_COUNT,
        GOOD_EXCEPTED_GAME_COUNT..MAX_SAFE_EXCEPTED_GAME_COUNT => since_last_sync_h,
        _ => MAX_SAFE_EXCEPTED_GAME_COUNT,
    }
}
