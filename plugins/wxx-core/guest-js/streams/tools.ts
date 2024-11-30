import { LcuEventType, LcuEventTypeEnum } from '../events'
import { Observable, filter, share, map } from 'rxjs'
import { LCU_EVENT_BUS } from './bus'

export const createSubStream = <T = unknown>(
  uri: string,
  eventTypes: (LcuEventTypeEnum | 'All')[],
  isSharing: boolean = true,
  mapper?: (ev: LcuEventType) => T
): Observable<T> => {
  const customTypeSet = new Set(eventTypes);

  const checker = customTypeSet.has('All')
    ? (ev: LcuEventType) => ev.uri === uri
    : (ev: LcuEventType) =>
      ev.uri === uri && customTypeSet.has(ev.eventType);

  mapper ??= (ev: LcuEventType) => {
    return ev.data as T;
  };
  
  if (!isSharing) {
    return LCU_EVENT_BUS.pipe(filter(checker), map(mapper));
  }

  return LCU_EVENT_BUS.pipe(filter(checker), map(mapper), share());
};
