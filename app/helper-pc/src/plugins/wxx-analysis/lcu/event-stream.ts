/**
 * The following content may be migrated to
 * the core package in the future
 */

import {
  GameflowPhase,
  SummonerInfo,
  BallotLegacy,
  TauriEvent,
  LcuEventType,
  listenLcuEvent,
  LcuEventTypeEnum,
} from 'tauri-plugin-wxx-core';
import { Subject, Observable, filter, map, share } from 'rxjs';

const lcuEventBus = new Subject<TauriEvent<LcuEventType>>();
listenLcuEvent((ev) => lcuEventBus.next(ev)).catch(console.error);

export const createSubStream = <T = unknown>(
  uri: string,
  eventTypes: (LcuEventTypeEnum | 'All')[],
  isSharing: boolean = true,
  mapper?: (ev: TauriEvent<LcuEventType>) => T
): Observable<T> => {
  const customTypeSet = new Set(eventTypes);

  const checker = customTypeSet.has('All')
    ? (ev: TauriEvent<LcuEventType>) => ev.payload.uri === uri
    : (ev: TauriEvent<LcuEventType>) =>
        ev.payload.uri === uri && customTypeSet.has(ev.payload.eventType);

  mapper ??= (ev: TauriEvent<LcuEventType>) => {
    return ev.payload.data as T;
  };

  if (!isSharing) {
    return lcuEventBus.pipe(filter(checker), map(mapper));
  }

  return lcuEventBus.pipe(filter(checker), map(mapper), share());
};

export const gameFlowPhaseStream = createSubStream<GameflowPhase>(
  '/lol-gameflow/v1/gameflow-phase',
  ['Update']
);
