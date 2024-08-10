import {createLcuEventHandlerManager} from "tauri-plugin-wxx-core";

type STRING_ARRAY<T extends Array<string>> = T
export type EMIT_NAMES = STRING_ARRAY<[
  'current-summoner-update',
]>

export const appListener =
  createLcuEventHandlerManager<EMIT_NAMES>()
