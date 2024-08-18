import {
  GameflowPhase,
  lcuFetch,
  processStatusStream,
  LcuProcessStatus,
  SummonerInfo
} from 'tauri-plugin-wxx-core'
import { ws } from '../ws'


export const uploadGameStatus = () => {
  let summoner: SummonerInfo | null = null

  const updateSummoner = (info: SummonerInfo) => {
    summoner = info
    ws.send('lcu', {
      summoner,
      action: 'update-summoner',
    })
  }

  const updatePhase = (phase: GameflowPhase | string) => {
    if (summoner !== null) {
      ws.send('lcu', {
        phase,
        action: 'update-phase',
        summonerId: summoner.summonerId,
      })
    }
  }

  const statusSubscription = processStatusStream
    .subscribe(status => {
      if (status === LcuProcessStatus.Started) {
        lcuFetch<SummonerInfo>({
          endpoint: '/lol-summoner/v1/current-summoner',
          method: 'get',
        }).then(updateSummoner)

        lcuFetch<GameflowPhase>({
          endpoint: '/lol-gameflow/v1/gameflow-phase',
          method: "get",
        }).then(updatePhase)
      } else {
        updatePhase('Offline')
        summoner = null
      }
    })

  return () => {
    statusSubscription.unsubscribe()
  }
}
