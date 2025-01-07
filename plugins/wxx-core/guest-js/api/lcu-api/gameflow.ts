import { api } from './utils';
import { GameflowPhase, GameflowSession } from '../../types/lcu-api/gameflow';

export const getGameflowPhase = api('/lol-gameflow/v1/gameflow-phase')
  .noPayload<GameflowPhase>('get');

export const getGameflowSession = api('/lol-gameflow/v1/session')
  .noPayload<GameflowSession>('get');

export const earlyExit = api('/lol-gameflow/v1/early-exit')
  .noPayload('post');
