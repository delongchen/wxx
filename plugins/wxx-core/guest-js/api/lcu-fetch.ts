import { invoke } from '@tauri-apps/api/core';

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

export const lcuFetch = async <T = unknown>(
  endpoint: string,
  options: {
    method?: LcuAllowedMethod,
    body?: RequestBody,
    timeout?: number,
  } = {},
) => {
  const { method = 'get', body = null, timeout = 0 } = options;

  return invoke<T>(
    'plugin:wxx-core|lcu_fetch',
    { endpoint, method, body, timeout },
  );
};
