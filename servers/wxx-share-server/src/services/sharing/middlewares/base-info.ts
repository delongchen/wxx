import {
  SummonerInfoRaw,
  SummonerSharingServiceName
} from 'wxx-protobufs/lcu.summoner';
import {
  GamePhaseSharingServiceName,
  PhaseWithSummonerId,
  gameflowPhaseEnumToJSON, gameflowPhaseEnumFromJSON,
} from 'wxx-protobufs/lcu.gameflow';
import { Middleware } from '../types';
import { redisClient, toHSETObject } from "../../../data/redis";
import { SummonerState, SummonerStates } from "wxx-protobufs/rest.user";


const isUndefined = (value: any): value is undefined => value === void 0

let statesChanged = true;
let statesCache: Buffer;
export const getAllSummonerStates = async () => {
  if (!statesChanged) {
    return statesCache;
  }

  const multi = redisClient.multi()
  for await (const id of redisClient.sScanIterator('s:ids')) {
    multi.hGetAll(`s:base:${id}`)
    multi.hGetAll(`s:reroll:${id}`)
    multi.get(`s:phase:${id}`)
  }

  const executed = await multi.exec()
  const states: SummonerState[] = []
  for (let i = 0; i <= executed.length - 3; i += 3) {
    const [base, reroll, phase] = [executed[i], executed[i + 1], executed[i + 2]]
    states.push(SummonerState.fromJSON({
      phase: gameflowPhaseEnumFromJSON(phase),
      info: {
        base,
        rerollPoints: reroll,
      }
    }))
  }

  statesCache = Buffer.from(SummonerStates.encode({ states }).finish());
  statesChanged = false;
  return statesCache;
}

const sharingSummonerInfo: Middleware<SummonerInfoRaw> = {
  endpoint: SummonerSharingServiceName,
  serializer: SummonerInfoRaw,
  handler: async ctx => {
    const { base, rerollPoints } = ctx.data
    if (isUndefined(base) || isUndefined(rerollPoints)) return

    const { summonerId } = base
    await redisClient
      .multi()
      .sAdd('s:ids', `${summonerId}`)
      .hSet(`s:base:${summonerId}`, toHSETObject(base))
      .hSet(`s:reroll:${summonerId}`, toHSETObject(rerollPoints))
      .exec();

    statesChanged = true;

    ctx.broadcast();
  },
};

const sharingGamePhase: Middleware<PhaseWithSummonerId> = {
  endpoint: GamePhaseSharingServiceName,
  serializer: PhaseWithSummonerId,
  handler: async ctx => {
    const { summonerId, phase } = ctx.data;

    await redisClient.set(`s:phase:${summonerId}`, gameflowPhaseEnumToJSON(phase));
    statesChanged = true;

    ctx.broadcast();
  },
};

export default [sharingSummonerInfo, sharingGamePhase] as Middleware<any>[];
