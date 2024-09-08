import { SummonerInfoBody } from 'wxx-protobufs/lcu.summoner'
import { GameflowPhaseEnum } from 'wxx-protobufs/lcu.gameflow'

interface SharingState {
  summonerMap: Map<number, UserInfo>,
}

interface UserInfo {
  info: SummonerInfoBody;
  phase: GameflowPhaseEnum;
}

export const sharingState: SharingState = {
  summonerMap: new Map(),
}
