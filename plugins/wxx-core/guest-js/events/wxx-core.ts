import {createListenFn} from "./utils";


export enum LcuProcessStatus {
  NotStarted = 1,
  NotStartedWithAdmin,
  Started,
}

export const listenProcessStatus = createListenFn<LcuProcessStatus>('LCU_PROCESS_STATUS_EVENT');
