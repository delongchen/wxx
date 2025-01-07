import { Subject, BehaviorSubject } from 'rxjs'
import {
  LcuEventType,
  LcuProcessStatus,
  listenLcuEvent,
  listenProcessStatus,
} from '../events';

export const LCU_EVENT_BUS = new Subject<LcuEventType>();
listenLcuEvent(ev => {
  if (ev !== null) {
    LCU_EVENT_BUS.next(ev)
  }
})

export const LCU_PROCESS_STATUS_BUS = new BehaviorSubject<LcuProcessStatus>(
  LcuProcessStatus.NotStarted
)
listenProcessStatus(ev => {
  if (ev.payload !== LCU_PROCESS_STATUS_BUS.getValue()) {
    LCU_PROCESS_STATUS_BUS.next(ev.payload)
  }
})
