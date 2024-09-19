import { LcuProcessStatus, listenProcessStatus } from 'tauri-plugin-wxx-core';
import { Subject } from 'rxjs';

export const lcuProcessStatusBus = new Subject<LcuProcessStatus>();
let prevStatus = -1;
listenProcessStatus(ev => {
  const currStatus = ev.payload;
  if (currStatus !== prevStatus) {
    prevStatus = currStatus;
    lcuProcessStatusBus.next(currStatus);
  }
});
