use std::sync::{Arc, Mutex};
use sysinfo::System;

#[cfg(target_os = "windows")]
const TARGET_PROCESS: &str = "LeagueClientUx.exe";
#[cfg(target_os = "linux")]
const TARGET_PROCESS: &str = "LeagueClientUx.";
#[cfg(target_os = "macos")]
const TARGET_PROCESS: &str = "LeagueClientUx";

type NextStepFn = Arc<Mutex<dyn FnMut() -> Option<bool> + Send + Sync>>;
pub struct LeagueClientUxStateIterator {
    next_step: NextStepFn,
}

impl Iterator for LeagueClientUxStateIterator {
    type Item = bool;

    fn next(&mut self) -> Option<Self::Item> {
        let mut next_step = self.next_step.lock().unwrap();
        (*next_step)()
    }
}

pub fn create_lcu_proccess_state_iterator() -> LeagueClientUxStateIterator {
    let mut sys = System::new_all();
    sys.refresh_processes();

    let next_step: NextStepFn = Arc::new(Mutex::new(move || {
        let process = sys
            .processes()
            .values()
            .find(|p| p.name() == TARGET_PROCESS);

        match process {
            Some(_) => Some(true),
            None => Some(false),
        }
    }));

    LeagueClientUxStateIterator { next_step }
}
