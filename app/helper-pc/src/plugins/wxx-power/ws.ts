export class WebSocketManager {
  private socket: WebSocket | null = null
  // private reconnectAttempts: number = 0
  private reconnectIntervalMs: number = 1000

  constructor(
    private readonly url: string,
  ) {}

  public connect() {
    let ws: WebSocket | null = null

    try {
      ws = new WebSocket(this.url)
    } catch (e) {
      this.reconnect()
      return
    }

    ws.addEventListener('open', ev => {
      this.handleOpen(ev)
    })

    ws.addEventListener('message', ev => {
      this.handleMessage(ev)
    })

    ws.addEventListener('close', ev => {
      this.handleClose(ev)
    })

    ws.addEventListener('error', ev => {
      this.handleError(ev)
    })

    this.socket = ws
  }

  private handleOpen(ev: Event) {
    console.log('[ws] open: ', ev)
  }

  private handleMessage(ev: MessageEvent) {
    console.log(ev)
  }

  private reconnect(): void {
    setTimeout(() => {
      this.connect()
    }, this.reconnectIntervalMs)
  }

  private handleClose(ev: Event) {
    console.log('[ws] close: ', ev)
    this.reconnect()
  }

  private handleError(ev: Event) {
    console.log('[ws] error: ', ev)
  }

  public send(eventType: string, payload: unknown) {
    if (
      this.socket !== null &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      this.socket.send(JSON.stringify({
        payload,
        type: eventType,
      }))
    }
  }
}

export const ws = new WebSocketManager('ws://192.168.5.3:11460/group/wxx')
