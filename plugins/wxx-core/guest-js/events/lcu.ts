import { createListenFn } from "./utils";
import { WxxCoreEventNames } from "../consts/events";

export type LcuEventTypeEnum = 'Update' | 'Create' | 'Delete'

export interface LcuEventType<T = unknown> {
  eventType: LcuEventTypeEnum
  uri: string
  data: T
}

export const listenLcuEvent = createListenFn<LcuEventType>(
  WxxCoreEventNames.LCU_WS_EVENT
)
