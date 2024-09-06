import {createListenFn} from './utils'

export type LcuEventTypeEnum = 'Update' | 'Create' | 'Delete'

export interface LcuEventType<T = unknown> {
  eventType: LcuEventTypeEnum
  uri: string
  data: T
}

export const listenLcuEvent = createListenFn<LcuEventType>('LCU_WS_EVENT');
