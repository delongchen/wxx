import {createTauriEventStream} from "./utils";
import {filter, map, Observable, share} from 'rxjs'

export type LcuEventTypeEnum = 'Update' | 'Create' | 'Delete'

export interface LcuEventType<T = unknown> {
  eventType: LcuEventTypeEnum
  uri: string
  data: T
}

export const lcuEventStream =
  createTauriEventStream<LcuEventType>('LCU_WS_EVENT')
    .pipe(share())

export const createSubLcuEventStream = <T = unknown>(
  uri: string,
  eventTypes: LcuEventTypeEnum[],
): Observable<T> => {
  const allowedTypeSet = new Set(eventTypes)

  return lcuEventStream
    .pipe(
      filter(ev =>
        ev.payload.uri === uri &&
        allowedTypeSet.has(ev.payload.eventType)
      ),
      map(ev => ev.payload.data as T),
      share(),
    )
}
