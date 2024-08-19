import { Subject } from 'rxjs'


export class WxxWebSocket {
  private ws: WebSocket | null = null
  public stream = new Subject<MessageEvent>()

  constructor(
    private baseUrl: string,
    private reconnectIntervalMs: number = 3000,
  ) {}

  private reconnect(group: string) {
    setTimeout(() => {
      this.connect(group)
    }, this.reconnectIntervalMs)
  }

  public connect(group: string = 'wxx') {
    if (
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN
    ) {
      this.ws.close(1000)
      this.ws = null
    }

    const ws = new WebSocket(`${this.baseUrl}/group/${group}`)
    ws.onopen = () => {}
    ws.onerror = ev => {
      console.log(`[error] ${this.baseUrl}/group/${group}: `, ev)
    }
    ws.onclose = () => {
      this.reconnect(group)
    }
    ws.onmessage = ev => {
      this.stream.next(ev)
    }

    this.ws = ws
  }

  public send(message: any) {
    if (
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN
    ) {
      if (typeof message !== 'string') {
        try {
          message = JSON.stringify(message)
        } catch (e) {
          return
        }
      }

      this.ws.send(message)
    }
  }
}
