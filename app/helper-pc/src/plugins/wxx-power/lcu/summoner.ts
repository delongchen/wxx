import {
  LcuEventHandler,
} from "tauri-plugin-wxx-core";

import type { EMIT_NAMES } from './app-listener'

const createCurSummonerHandler = (): LcuEventHandler<EMIT_NAMES> => {
  return {
    name: 'curSummoner',
    active: true,
    handle: (ev, emit) => {
      if (
        ev.eventType === 'Update' &&
        ev.uri === '/lol-summoner/v1/current-summoner'
      ) {
        emit('current-summoner-update', ev.data)
      }
    },
  }
}

export const curSummonerHandler = createCurSummonerHandler()
