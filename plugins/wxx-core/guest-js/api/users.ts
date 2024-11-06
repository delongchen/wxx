import { resolveCmdName } from './resolve';
import { invoke } from '@tauri-apps/api/core';
import { SummonerInfoWithoutReRoll } from '../types/lcu-api/summoner';

const CMD_RECORD_SUMMONER = resolveCmdName('record_summoner');
const CMD_READ_LOCAL_SUMMONERS = resolveCmdName('read_local_summoners');
const CMD_READ_CACHED_MATCHES = resolveCmdName('read_cached_matches');

export const recordCurSummoner = async () => {
  return await invoke<void>(CMD_RECORD_SUMMONER);
};

export const readLocalSummoners = async () => {
  return await invoke<SummonerInfoWithoutReRoll[]>(CMD_READ_LOCAL_SUMMONERS);
};

export const readLocalMatches = async (puuid: string) => {
  return await invoke<ArrayBuffer>(CMD_READ_CACHED_MATCHES, { puuid });
};