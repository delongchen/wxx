/**
 * The following content may be migrated to
 * the core package in the future
 */

import {
  GameflowPhase,
  SummonerInfo,
  BallotLegacy,
  Lobby,
  TauriEvent,
  LcuEventType,
  listenLcuEvent,
  LcuEventTypeEnum,
} from 'tauri-plugin-wxx-core';
import { Subject, Observable, filter, map, share } from 'rxjs';

const lcuEventBus = new Subject<TauriEvent<LcuEventType>>();
listenLcuEvent(ev => lcuEventBus.next(ev));

export const subStream = <T = unknown>(
  uri: string,
  eventTypes: LcuEventTypeEnum[],
): Observable<T> => {
  const allowedTypeSet = new Set(eventTypes);

  return lcuEventBus.pipe(
    filter(ev => ev.payload.uri === uri && allowedTypeSet.has(ev.payload.eventType)),
    map(ev => ev.payload.data as T),
    share(),
  );
};

export const lobbyStream = subStream<Lobby | null>('/lol-lobby/v2/lobby', [
  'Create',
  'Update',
  'Delete',
]);

export const gameFlowPhaseStream = subStream<GameflowPhase>('/lol-gameflow/v1/gameflow-phase', [
  'Update',
]);

export const currentSummonerUpdateStream = subStream<SummonerInfo>(
  '/lol-summoner/v1/current-summoner',
  ['Update'],
);

export const gameBallotStream = subStream<BallotLegacy>('/lol-honor-v2/v1/ballot', ['Create']);
