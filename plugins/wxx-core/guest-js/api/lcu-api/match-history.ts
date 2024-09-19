import { api } from './utils';
import { MatchHistory } from '../../types/lcu-api/match-history';

export const getMatchHistory = api(
  '/lol-match-history/v3/matchlist/account/:summonerId?startIndex=:startIndex&endIndex=:endIndex',
).noPayload<MatchHistory>('get');
