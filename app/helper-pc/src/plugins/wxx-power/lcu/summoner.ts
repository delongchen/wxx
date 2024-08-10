import {
  LcuEventHandler,
  LcuEventType,
  SummonerInfo,
} from "tauri-plugin-wxx-core";

const createCurSummonerHandler = (): LcuEventHandler => {
  const handle = (
    ev: LcuEventType,
    emit: (name: string, data: SummonerInfo) => void
  ) => {
    if (
      ev.eventType === 'Update' &&
      ev.uri === '/lol-summoner/v1/current-summoner'
    ) {
      emit('current-summoner-update', ev.data as SummonerInfo)
    }
  }

  return {
    name: 'curSummoner',
    active: true,
    handle,
  }
}

export const curSummonerHandler = createCurSummonerHandler()
