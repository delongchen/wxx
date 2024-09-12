import { api } from './utils';
import { SummonerInfo } from '../../types/lcu-api/summoner';

export const getCurrentSummoner = api('/lol-summoner/v1/current-summoner')
  .noPayload<SummonerInfo>('get');

export const getSummoner = api('/lol-summoner/v1/summoners/:id')
  .noPayload<SummonerInfo>('get');

export const getSummonerByPuuid = api('/lol-summoner/v2/summoners/puuid/:puuid')
  .noPayload<SummonerInfo>('get');

export const updateSummonerProfile = api('/lol-summoner/v1/current-summoner/summoner-profile')
  .withPayload<void, {
    inventory?: string;
    key: string;
    value: any;
  }>('post');
