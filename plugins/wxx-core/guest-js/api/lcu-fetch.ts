import { invoke } from "@tauri-apps/api/core";

export type LcuAllowedMethod =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'delete'
  | 'DELETE'

type RequestBody = Record<string, any>

export interface LcuFetchRequest {
  method: LcuAllowedMethod
  endpoint: string
  body?: RequestBody | null
}

export const lcuFetch = async <T>(req: LcuFetchRequest) => {
  const {
    method,
    endpoint,
    body = null
  } = req

  return invoke<T>(
    'plugin:wxx-core|lcu_fetch',
    { method, endpoint, body }
  )
}
