import { createSubStream } from './tools'
import { GameflowPhase } from '../types/lcu-api/gameflow';
import { SummonerInfo } from '../types/lcu-api/summoner';
import { BallotLegacy } from '../types/lcu-api/honorV2';

export const gameFlowPhaseStream = createSubStream<GameflowPhase>(
  '/lol-gameflow/v1/gameflow-phase',
  ['Update']
);

export const currentSummonerUpdateStream = createSubStream<SummonerInfo>(
  '/lol-summoner/v1/current-summoner',
  ['Update']
);

export const gameBallotStream = createSubStream<BallotLegacy>(
  '/lol-honor-v2/v1/ballot', 
  ['Create']
);
