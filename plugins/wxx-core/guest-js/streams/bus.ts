import { Subject, BehaviorSubject } from 'rxjs'
import {
  LcuEventType,
  LcuProcessStatus,
  listenLcuEvent,
  listenProcessStatus,
  TauriEvent,
} from '../events';

export const LCU_EVENT_BUS = new Subject<TauriEvent<LcuEventType>>();
listenLcuEvent(ev => LCU_EVENT_BUS.next(ev))

export const LCU_PROCESS_STATUS_BUS = new BehaviorSubject<LcuProcessStatus>(
  LcuProcessStatus.NotStarted
)
listenProcessStatus(ev => {
  if (LCU_PROCESS_STATUS_BUS.getValue() !== ev.payload) {
    LCU_PROCESS_STATUS_BUS.next(ev.payload)
  }
})
