import { SummonerInfoBody, SummonerSharingServiceName } from 'wxx-protobufs/lcu.summoner';
import {
  GameflowPhaseEnum,
  GamePhaseSharingServiceName,
  PhaseWithSummonerId,
} from 'wxx-protobufs/lcu.gameflow';
import { Middleware } from '../types';
import { sharingState } from '../store';
import { createMapHelper } from '../../../utils';

const summoners = createMapHelper(sharingState.summonerMap);

const sharingSummonerInfo: Middleware<SummonerInfoBody> = {
  endpoint: SummonerSharingServiceName,
  serializer: SummonerInfoBody,
  handler: ctx => {
    summoners.need(
      ctx.data.summonerId,
      summoner => {
        summoner.info = ctx.data;
      },
      setter => setter({
        info: ctx.data,
        phase: GameflowPhaseEnum.None,
      }),
    );
    ctx.broadcast();
  },
};

const sharingGamePhase: Middleware<PhaseWithSummonerId> = {
  endpoint: GamePhaseSharingServiceName,
  serializer: PhaseWithSummonerId,
  handler: ctx => {
    summoners.need(ctx.data.summonerId, summoner => {
      summoner.phase = ctx.data.phase;
    });
    ctx.broadcast();
  },
};

export default [sharingSummonerInfo, sharingGamePhase] as Middleware<any>[];
