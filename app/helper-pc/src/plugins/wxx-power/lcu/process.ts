import { LcuProcessStatus, listenProcessStatus } from 'tauri-plugin-wxx-core';
import { BehaviorSubject } from 'rxjs';

export const lcuProcessStatusBus = new BehaviorSubject<LcuProcessStatus>(
  LcuProcessStatus.NotStarted
);

let prevStatus = LcuProcessStatus.NotStarted;
listenProcessStatus((ev) => {
  const currStatus = ev.payload;
  if (currStatus !== prevStatus) {
    prevStatus = currStatus;
    lcuProcessStatusBus.next(currStatus);
  }
});
