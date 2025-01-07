import { api } from './utils';
import { Lobby, LobbyMember } from '../../types/lcu-api/lobby';

export const createQueueLobby = api('/lol-lobby/v2/lobby')
  .withPayload<void, { queueId: number }>('post');

export const promote = api('/lol-lobby/v2/lobby/members/:summonerId/promote')
  .noPayload<number>('post');

export const kick = api('/lol-lobby/v2/lobby/members/:summonerId/kick')
  .noPayload<number>('post');

export const getMembers = api('/lol-lobby/v2/lobby/members')
  .noPayload<LobbyMember[]>('get');

export const getLobby = api('/lol-lobby/v2/lobby')
  .noPayload<Lobby>('get');

export const searchMatch = api('/lol-lobby/v2/lobby/matchmaking/search')
  .noPayload('post');

export const deleteSearchMatch = api('/lol-lobby/v2/lobby/matchmaking/search')
  .noPayload('delete');

export const playAgain = api('/lol-lobby/v2/play-again')
  .noPayload('post');

export const getEogStatus = api('/lol-lobby/v2/party/eog-status')
  .noPayload('get');
