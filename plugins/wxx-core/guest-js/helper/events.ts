import { listen } from '@tauri-apps/api/event'

export const enum WxxEventType {
  WXX_LCU_STATUS_EVENT = 'WXX_LCU_STATUS_EVENT',
}

export const enum LcuStatusCode {
  NotStarted,
  NotStartedWithAdmin ,
  Started ,
}

export const onLcuStatusChange = async (cb: (code: LcuStatusCode) => void) => {
  await listen<{status: LcuStatusCode}>(WxxEventType.WXX_LCU_STATUS_EVENT, event => {
    cb(event.payload.status)
  })
}
