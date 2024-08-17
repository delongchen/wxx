import {LcuEventType, listenLcuEvent} from "./lcu";
import {UnlistenFn} from "@tauri-apps/api/event";


type TypeOfValue<
  MAP extends Record<string, any>,
  KEY extends (keyof MAP | string),
> = KEY extends keyof MAP ? MAP[KEY] : any

export type LcuEventAdapter<MAP extends Record<string, any>> = (
  ev: LcuEventType,
  emit: <KEY extends (keyof MAP | string)>(
    key: KEY,
    value: TypeOfValue<MAP, KEY>,
  ) => void,
) => void

export class LcuEventEmitter<
  MAP extends Record<string, any> = {},
> {
  private readonly adapterMap: Map<string, LcuEventAdapter<any>>
  private readonly listenerMap: Map<string, Set<(value: any) => void>>
  private listenerHandle: Promise<UnlistenFn> | null = null
  private pausing: boolean = false

  constructor() {
    this.adapterMap = new Map
    this.listenerMap = new Map
  }

  public pause() {
    this.pausing = true
  }

  public unpause() {
    this.pausing = false
  }

  public async stop() {
    if (this.listenerHandle !== null) {
      const unListen = await this.listenerHandle
      unListen()
      this.listenerHandle = null
    }
  }

  public async restart() {
    await this.stop()
    this.start()
  }

  public start() {
    if (this.listenerHandle === null) {
      this.listenerHandle = listenLcuEvent(ev => {
        if (this.pausing) return

        for (const adapter of this.adapterMap.values()) {
          adapter(ev, (key, value) => {
            this.emit(key, value)
          })
        }
      })
    }
  }

  public registerAdapter(
    name: string,
    adapter: LcuEventAdapter<MAP>,
    active: boolean = false,
  ) {
    this.adapterMap.set(name, adapter)
  }

  public emit(key: string | symbol | number, value: any) {
    this.listenerMap
      .get(key as string)
      ?.forEach(listener => {
        listener(value)
      })
  }

  public on<KEY extends (keyof MAP | string)>(
    key: KEY,
    listener: (value: TypeOfValue<MAP, KEY>) => void
  ) {
    let listenerSet = this.listenerMap.get(key as string)

    if (listenerSet === undefined) {
      listenerSet = new Set
      this.listenerMap.set(key as string, listenerSet)
    }

    listenerSet.add(listener)

    return () => {
      listenerSet.delete(listener)
    }
  }
}
