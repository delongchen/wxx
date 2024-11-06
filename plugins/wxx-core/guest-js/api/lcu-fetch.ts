import { invoke } from '@tauri-apps/api/core';
import { resolveCmdName } from './resolve';

export type LcuAllowedMethod =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'delete'
  | 'DELETE'
  | 'patch'
  | 'PATCH'

export type RequestBody = Record<string, any>

interface LcuFetchOptions {
  method?: LcuAllowedMethod;
  body?: RequestBody;
  timeout?: number;
}

const CMD_LCU_FETCH = resolveCmdName('lcu_fetch')

/**
 * request lcu data like using `fetch` api
 * 
 * the default method is 'get'
 * 
 * @param endpoint
 * @param options
 * @example
 * // get method
 * const currentSummoner = lcuFetch<SummonerInfo>("/lol-summoner/v1/current-summoner")
 * 
 * // post method
 * const honorResult = lcuFetch<void>("/lol-honor-v2/v1/honor-player", {method: 'post', body = {}})
 */
export const lcuFetch = async <T = unknown>(
  endpoint: string,
  options: LcuFetchOptions = {},
) => {
  const { method = 'get', body = null, timeout = 0 } = options;

  return await invoke<T>(
    CMD_LCU_FETCH,
    { endpoint, method, body, timeout },
  );
};
