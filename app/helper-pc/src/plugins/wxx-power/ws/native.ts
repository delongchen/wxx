import { Subject } from 'rxjs'


export class WxxWebSocket {
  private ws: WebSocket | null = null
  public stream = new Subject<MessageEvent>()

  constructor(
    private baseUrl: string,
    private reconnectIntervalMs: number = 3000,
  ) {}

  private reconnect(group: string) {
    if (this.ws !== null) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000)
      }
      this.ws = null
    }

    setTimeout(() => {
      this.connect(group)
    }, this.reconnectIntervalMs)
  }

  public connect(group: string = 'wxx') {
    console.log('[ws] connecting...', group)
    if (
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN
    ) return

    const ws = new WebSocket(`${this.baseUrl}/group/${group}`)
    ws.onopen = () => {}
    ws.onerror = ev => {
      console.log(`[error] ${this.baseUrl}/group/${group}: `, ev)
    }
    ws.onclose = () => {
      console.log('[ws] closed')
      this.reconnect(group)
    }
    ws.onmessage = ev => {
      this.stream.next(ev)
    }

    this.ws = ws
  }

  public send(message: Uint8Array) {
    if (
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN
    ) {
      this.ws.send(message)
    }
  }
}

export const ws = new WxxWebSocket('ws://192.168.5.3:11460')
ws.connect()
