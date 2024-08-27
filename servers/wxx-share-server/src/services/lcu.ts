import {
  GameflowPhaseEnum,
  SummonerInfoBody,
  PhaseWithSummonerId,
} from 'wxx-protobufs/lcu'
import { wsMessageBus } from '../ws/manager'

interface UserInfo {
  info: SummonerInfoBody,
  phase: GameflowPhaseEnum
}

export const summonerMap: Map<number, UserInfo> = new Map

wsMessageBus
  .subscribe(message => {
    if (message.endpoint === 'update-summoner') {
      const cur = SummonerInfoBody.decode(message.body)
      const prev = summonerMap.get(cur.summonerId)

      if (prev !== undefined) {
        prev.info = cur
      } else {
        summonerMap.set(cur.summonerId, {
          info: cur,
          phase: GameflowPhaseEnum.Lobby,
        })
      }

      message.group.broadcast(message.bytes)
    } else if (message.endpoint === 'update-phase') {
      const cur = PhaseWithSummonerId.decode(message.body)
      const prev = summonerMap.get(cur.summonerId)

      if (prev !== undefined) {
        prev.phase = cur.phase
        message.group.broadcast(message.bytes)
      }
    }
  })
