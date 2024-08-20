import { SummonerInfoMessage } from 'wxx-protobufs/lib/lcu/summoner'
import { GameflowPhaseMessage, GameflowPhaseEnum } from 'wxx-protobufs/lib/lcu/gameflow'
import {
  currentSummonerUpdateStream,
  gameFlowPhaseStream,
} from '../../lcu/event-stream'
import { processStatusStream, LcuProcessStatus } from 'tauri-plugin-wxx-core/events'
import { ws } from "../../ws/native";
import { GameflowPhase, SummonerInfo } from "tauri-plugin-wxx-core";
import { lcuFetch } from 'tauri-plugin-wxx-core/api'


let currentSummoner: SummonerInfo | null = null

const updateAndSendInfo = (info: SummonerInfo) => {
  currentSummoner = info
  ws.send(SummonerInfoMessage.encode({
    header: { endpoint: '/lol-summoner/v1/current-summoner' },
    body: info,
  }).finish())
}

const sendPhase = (phase?: GameflowPhase) => {
  if (currentSummoner === null) return

  ws.send(GameflowPhaseMessage.encode({
    header: { endpoint: '/lol-gameflow/v1/gameflow-phase' },
    body: {
      summonerId: currentSummoner.summonerId,
      phase: phase === undefined ?
        GameflowPhaseEnum.UNRECOGNIZED
        :
        GameflowPhaseEnum[phase],
    }
  }).finish())
}

export const collectSummoner = () => {
  const summonerSubscription = currentSummonerUpdateStream
    .subscribe(updateAndSendInfo)

  const phaseSubscription = gameFlowPhaseStream
    .subscribe(sendPhase)

  const processStatusSubscription = processStatusStream
    .subscribe(async status => {
      if (status === LcuProcessStatus.Started) {
        await lcuFetch<SummonerInfo>({
          endpoint: '/lol-summoner/v1/current-summoner',
          method: 'get',
        }).then(updateAndSendInfo)

        await lcuFetch<GameflowPhase>({
          endpoint: '/lol-gameflow/v1/gameflow-phase',
          method: 'get'
        }).then(sendPhase)
      } else {
        sendPhase()
        currentSummoner = null
      }
    })

  return () => {
    summonerSubscription.unsubscribe()
    phaseSubscription.unsubscribe()
    processStatusSubscription.unsubscribe()
  }
}
