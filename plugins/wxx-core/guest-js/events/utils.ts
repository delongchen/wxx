import { listen, EventCallback } from '@tauri-apps/api/event'


export const createListenFn = <T>(eventName: string) =>
  (listener: EventCallback<T>) => listen(eventName, listener);
