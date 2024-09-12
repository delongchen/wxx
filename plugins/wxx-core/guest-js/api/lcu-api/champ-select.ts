import { api } from './utils';
import { CarouselSkins, ChampSelectSession, ChampSelectSummoner, GridChamp } from '../../types/lcu-api/champ-select';

export const getChampSelectSession = api('/lol-champ-select/v1/session')
  .noPayload<ChampSelectSession>('get');

export const getAllGridChamps = api('/lol-champ-select/v1/all-grid-champions')
  .noPayload<GridChamp[]>('get');

const action = api('/lol-champ-select/v1/session/actions/:actionId')
  .withPayload('patch');

export const pickOrBan = (
  actionId: number,
  championId: number,
  completed: boolean,
  type: 'pick' | 'ban',
) => action({ championId, completed, type }, { actionId });

export const intentChampion = (
  actionId: number,
  championId: number,
) => action({ championId }, { actionId });

export const getSession = api('/lol-champ-select/v1/session')
  .noPayload<ChampSelectSession>('get');

export const benchSwap = api('/lol-champ-select/v1/session/bench/swap/:champId')
  .noPayload<void>('post');

export const declineTrade = api('/lol-champ-select/v1/session/trades/:tradeId/decline')
  .noPayload('post');

export const getPickableChampIds = api('/lol-champ-select/v1/pickable-champion-ids')
  .noPayload<number[]>('get');

export const getBannableChampIds = api('/lol-champ-select/v1/bannable-champion-ids')
  .noPayload('get');

export const reroll = api('/lol-champ-select/v1/session/my-selection/reroll')
  .noPayload('post');

export const getCurrentChamp = api('/lol-champ-select/v1/current-champion')
  .noPayload('get');

export const getChampSelectSummoner = api('/lol-champ-select/v1/summoners/:cellId')
  .noPayload<ChampSelectSummoner>('get');

export const setSkin = api('/lol-champ-select/v1/session/my-selection')
  .withPayload<void, { selectedSkinId: number }>('patch');

export const getCarouselSkins = api('/lol-champ-select/v1/skin-carousel-skins')
  .noPayload<CarouselSkins[]>('get');
