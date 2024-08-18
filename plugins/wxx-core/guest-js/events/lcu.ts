import {
  createTauriEventStream
} from "./utils";
import { WxxCoreEventNames } from "../consts/events";
import { share, filter, map, Observable } from 'rxjs'

export type LcuEventTypeEnum = 'Update' | 'Create' | 'Delete'

export interface LcuEventType<T = unknown> {
  eventType: LcuEventTypeEnum
  uri: string
  data: T
}

export const lcuEventStream = createTauriEventStream<LcuEventType>(
  WxxCoreEventNames.LCU_WS_EVENT
).pipe(share())

export const createSubLcuEventStream = <T = unknown>(
  uri: string,
  eventTypes: LcuEventTypeEnum[],
  shared: boolean = true,
): Observable<T> => {
  const allowedTypeSet = new Set(eventTypes)

  const result = lcuEventStream
    .pipe(
      filter(ev =>
        ev.payload.uri === uri &&
        allowedTypeSet.has(ev.payload.eventType)
      ),
      map(ev => ev.payload.data as T),
    )

  if (shared) {
    return result.pipe(share())
  }

  return result
}
