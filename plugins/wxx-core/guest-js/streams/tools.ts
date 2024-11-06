import { LcuEventType, LcuEventTypeEnum, TauriEvent } from '../events'
import { Observable, filter, map, share } from 'rxjs'
import { LCU_EVENT_BUS } from './bus'

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
    return LCU_EVENT_BUS.pipe(filter(checker), map(mapper));
  }

  return LCU_EVENT_BUS.pipe(filter(checker), map(mapper), share());
};
