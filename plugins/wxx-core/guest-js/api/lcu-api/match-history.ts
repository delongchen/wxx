import { invoke } from '@tauri-apps/api/core'
import { api } from './utils';
import { Game, MatchHistory } from '../../types/lcu-api/match-history';

export const fetch_match_history = async (puuid?: string) => {
  return invoke<{size: number}>('plugin:wxx-core|fetch_match_history', { puuid });
}

export const getCurrentSummonerMatchHistory = api('/lol-match-history/v1/products/lol/current-summoner/matches')
  .noPayload('get');

/**
 *  the `getMatchHistoryV3` api will throw this:
 *  {
 *    "errorCode":"RPC_ERROR",
 *    "httpStatus":404,
 *    "implementationDetails":{},
 *    "message":"not implemented: please use the puuid query"
 *  }
 */
// export const getMatchHistoryV3 = api('/lol-match-history/v3/matchlist/account/:summonerId?begIndex&endIndex',).noPayload<MatchHistory>('get');

export const getMatchHistory =
  api('/lol-match-history/v1/products/lol/:puuid/matches?begIndex&endIndex')
    .noPayload<MatchHistory>('get');

export const getGameDetail =
  api('/lol-match-history/v1/games/:gameId')
    .noPayload<Game>('get');
