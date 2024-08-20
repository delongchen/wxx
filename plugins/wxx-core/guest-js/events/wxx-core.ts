import { createTauriEventStream } from "./utils";
import { distinctUntilChanged, map, share } from "rxjs";


export enum LcuProcessStatus {
  NotStarted = 1,
  NotStartedWithAdmin,
  Started,
}

export const processStatusStream =
  createTauriEventStream<LcuProcessStatus>(
    'LCU_PROCESS_STATUS_EVENT'
  ).pipe(
    map(ev => ev.payload),
    distinctUntilChanged(),
    share(),
  )
