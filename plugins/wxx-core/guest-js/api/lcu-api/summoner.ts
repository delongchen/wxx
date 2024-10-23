import { api } from './utils';
import { SummonerInfo } from '../../types/lcu-api/summoner';

export const getCurrentSummoner = api('/lol-summoner/v1/current-summoner')
  .noPayload<SummonerInfo>('get', 2000);

export const getSummoner = api('/lol-summoner/v1/summoners/:id')
  .noPayload<SummonerInfo>('get');

export const getSummonerByPuuid = api('/lol-summoner/v2/summoners/puuid/:puuid')
  .noPayload<SummonerInfo>('get');

export const updateSummonerProfile = api('/lol-summoner/v1/current-summoner/summoner-profile')
  .withPayload<void, {
    key: string;
    value: any;
    inventory?: string;
  }>('post');
