/**
 * The following content may be migrated to
 * the core package in the future
 */

import {
  createSubLcuEventStream as subStream,
  GameflowPhase,
  SummonerInfo,
  BallotLegacy,
} from 'tauri-plugin-wxx-core';

export const gameFlowPhaseStream = subStream<GameflowPhase>('/lol-gameflow/v1/gameflow-phase', [
  'Update',
]);

export const currentSummonerUpdateStream = subStream<SummonerInfo>(
  '/lol-summoner/v1/current-summoner',
  ['Update'],
);

export const gameBallotStream = subStream<BallotLegacy>('/lol-honor-v2/v1/ballot', ['Create']);
