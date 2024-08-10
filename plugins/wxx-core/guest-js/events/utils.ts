import { listen } from "@tauri-apps/api/event";

export const createListenFn = <T>(eventName: string) => {
  return (cb: (ev: T) => void) =>
    listen<T>(eventName, event => {
      cb(event.payload)
    })
}
