import { listen } from '@tauri-apps/api/event'

export type LcuEventTypeEnum = 'Update' | 'Create' | 'Delete'

export interface LcuEventType<T = unknown> {
  eventType: LcuEventTypeEnum;
  uri: string;
  data: T;
}

export const listenLcuEvent = (listener: (ev: LcuEventType | null) => void) => {
  return listen<string>('LCU_WS_EVENT', ev => {
    const text = ev.payload

    let result: unknown
    try {
      result = JSON.parse(text)
    } catch (e) {
      return
    }

    if (Array.isArray(result)) {
      listener(result.pop() ?? null)
    }
  })
}
