import { createListenFn } from "./utils";
import { WxxCoreEventNames } from "../consts/events";

export type LcuEventTypeEnum = 'Update' | 'Create' | 'Delete'

export interface LcuEventType<T = unknown> {
  eventType: LcuEventTypeEnum
  uri: string
  data: T
}

export const listenLcuEvent = createListenFn<LcuEventType>(
  WxxCoreEventNames.LCU_WS_EVENT
)

export interface LcuEventHandler {
  name: string
  active: boolean
  handle: (
    ev: LcuEventType,
    emit: (event: string, data: any) => void
  ) => void | Promise<void>
}

const enum HandlerManagerStatus {
  PAUSE,
  RUNNING,
}

/**
 * The reason why create a listener manager
 * is that some listeners have a lifecycle that is almost as long as the application.
 * If you don't want them to be unlistened when the component is uninstalled,
 * then this is the better way.
 */
export const createLcuEventHandlerManager = () => {
  const handlerMap: Map<string, LcuEventHandler> = new Map
  const listenerMap: Map<string, Set<(data: any) => void>> = new Map

  let managerStatus = HandlerManagerStatus.RUNNING

  const handleEmit = (name: string, data: any) => {
    const exist = listenerMap.get(name)

    if (exist !== undefined) {
      for (const cb of exist) {
        cb(data)
      }
    }
  }

  const unlistenFnPromise = listenLcuEvent(ev => {
    if (managerStatus !== HandlerManagerStatus.RUNNING) return

    for (const handler of handlerMap.values()) {
      if (handler.active) {
        handler.handle(ev, handleEmit)
      }
    }
  })

  const stop = () => {
    unlistenFnPromise.then(fn => fn())
  }

  const register = (
    getters: ((() => LcuEventHandler) | LcuEventHandler)[]
  ) => {
    for (const getter of getters) {
      const handler = typeof getter === 'function' ?
        getter() : getter

      handlerMap.set(handler.name, handler)
    }
  }

  const setActive = (name: string, active: boolean) => {
    const exist = handlerMap.get(name)
    if (exist !== undefined) {
      exist.active = active
    }
  }

  const pause = () => {
    managerStatus = HandlerManagerStatus.PAUSE
  }

  const unpause = () => {
    managerStatus = HandlerManagerStatus.RUNNING
  }

  const on = <T>(event: string, cb: (data: T) => void) => {
    let listeners = listenerMap.get(event)

    if (listeners === undefined) {
      listeners = new Set
      listenerMap.set(event, listeners)
    }

    listeners.add(cb)

    return () => {
      listenerMap.get(event)?.delete(cb)
      if (listenerMap.get(event)?.size === 0) {
        listenerMap.delete(event)
      }
    }
  }

  return {
    stop,
    register,
    setActive,
    pause,
    unpause,
    on,
  }
}
