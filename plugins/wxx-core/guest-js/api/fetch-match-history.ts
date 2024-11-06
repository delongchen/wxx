import { resolveCmdName } from './resolve';
import { invoke } from '@tauri-apps/api/core';

const CMD_FETCH_MATCH_HISTORY = resolveCmdName('fetch_match_history')

export const createMatchHistoryFetchingTask = (
  puuid: string,
  onErr: (err: unknown) => void,
) => {
  invoke<void>(CMD_FETCH_MATCH_HISTORY, { puuid }).catch(onErr)
}
