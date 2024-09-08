import { SummonerInfoBody, SummonerSharingServiceName } from 'wxx-protobufs/lcu.summoner'
import { PhaseWithSummonerId, GamePhaseSharingServiceName } from 'wxx-protobufs/lcu.gameflow'
import { Middleware } from '../types'


const sharingSummonerInfo: Middleware<SummonerInfoBody> = {
  endpoint: SummonerSharingServiceName,
  serializer: SummonerInfoBody,
  handler: ctx => {

  }
}

const sharingGamePhase: Middleware<PhaseWithSummonerId> = {
  endpoint: GamePhaseSharingServiceName,
  serializer: PhaseWithSummonerId,
  handler: ctx => {

  }
}

export default [
  sharingSummonerInfo,
  sharingGamePhase,
] as Middleware<any>[]
