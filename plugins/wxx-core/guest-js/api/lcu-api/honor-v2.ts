import {api} from "./utils";
import {BallotLegacy} from "../../types/lcu-api/honorV2";

export const honor = api('/lol-honor-v2/v1/honor-player')
  .withPayload<void, {
    gameId: number,
    honorCategory: 'COOL' | 'SHOTCALLER' | 'HEART' | '' | 'OPT_OUT',
    summonerId?: string | number,
    puuid?: string,
  }>('post')

export const getBallot = api('/lol-honor-v2/v1/ballot')
  .noPayload<BallotLegacy>('get')
