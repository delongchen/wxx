import {listen} from '@tauri-apps/api/event'

interface LcuWsData {
  data: unknown
  eventType: string
  uri: string
}

type LcuWsDataHandler = (data: LcuWsData) => void

const ListenAllHandlerSet = new Set<LcuWsDataHandler>()
const ListenEventTypeHandlerMap = new Map<string, Set<LcuWsDataHandler>>()
const ListenUriHandlerMap = new Map<string, Set<LcuWsDataHandler>>()

const handleEvent = (data: LcuWsData) => {
  ListenAllHandlerSet.forEach(handler => handler(data))

  ListenEventTypeHandlerMap
    .get(data.eventType)
    ?.forEach(handler => handler(data))

  ListenUriHandlerMap
    .get(data.uri)
    ?.forEach(handler => handler(data))
}

listen<LcuWsData>("LCU_WS_EVENT", event => {
  handleEvent(event.payload)
})

export const listenByEventType = (eventType: string, handler: LcuWsDataHandler) => {
  let handlerSet = ListenEventTypeHandlerMap.get(eventType)

  if (handlerSet === undefined) {
    handlerSet = new Set
    ListenEventTypeHandlerMap.set(eventType, handlerSet)
  }

  handlerSet.add(handler)

  return () => {
    handlerSet.delete(handler)
    if (handlerSet.size === 0) {
      ListenEventTypeHandlerMap.delete(eventType)
    }
  }
}

export const listenByUri = (uri: string, handler: LcuWsDataHandler) => {

}

export const listenAll = (handler: LcuWsDataHandler) => {
  ListenAllHandlerSet.add(handler)

  return () => {
    ListenAllHandlerSet.delete(handler)
  }
}
