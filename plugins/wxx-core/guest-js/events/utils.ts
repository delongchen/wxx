import { listen, Event as TauriEvent } from "@tauri-apps/api/event";
import { Observable } from 'rxjs'


export const createListenFn = <T>(eventName: string) => {
  return (cb: (ev: T) => void) =>
    listen<T>(eventName, event => {
      cb(event.payload)
    })
}

export const createTauriEventStream = <T>(
  eventName: string,
) => new Observable<TauriEvent<T>>(subscriber => {
  const unlistenPromise = listen<T>(eventName, event => {
    subscriber.next(event)
  })

  return () => {
    unlistenPromise.then(unlisten => unlisten())
  }
})
