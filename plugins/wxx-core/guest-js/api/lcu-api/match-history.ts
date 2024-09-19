import { api } from './utils';
import { Game, MatchHistory } from '../../types/lcu-api/match-history';

export const getCurrentSummonerMatchHistory = api('/lol-match-history/v1/products/lol/current-summoner/matches')
  .noPayload('get');

export const getMatchHistoryV3 = api(
  '/lol-match-history/v3/matchlist/account/:summonerId?startIndex&endIndex',
).noPayload<MatchHistory>('get');

export const getMatchHistory =
  api('/lol-match-history/v1/products/lol/:puuid/matches?begIndex&endIndex')
    .noPayload<MatchHistory>('get');

export const getGameDetail =
  api('/lol-match-history/v1/games/:gameId')
    .noPayload<Game>('get');
