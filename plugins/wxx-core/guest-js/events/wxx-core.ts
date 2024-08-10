import {createListenFn} from "./utils";
import {WxxCoreEventNames} from "../consts/events";


export interface LcuProcessStatusEvent {
  statusCode: number
}

export const listenLcuProcessStatus = createListenFn<LcuProcessStatusEvent>(
  WxxCoreEventNames.LCU_PROCESS_STATUS_EVENT
)

export const onLcuProcessStatusChange = (cb: (ev: LcuProcessStatusEvent) => void) => {
  let cache = 0

  return listenLcuProcessStatus(({statusCode}) => {
    if (cache !== statusCode) {
      cb({ statusCode })
      cache = statusCode
    }
  })
}
