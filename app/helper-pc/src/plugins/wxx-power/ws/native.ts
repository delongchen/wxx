const FromVoidToVoid = () => {
};

export class WxxWebSocket {
  private ws: WebSocket | null = null;
  public onmessage: (ev: MessageEvent<unknown>) => void | Promise<void> = FromVoidToVoid;

  constructor(
    private baseUrl: string,
    private reconnectIntervalMs: number = 3000,
  ) {
  }

  private reconnect(group: string) {
    if (this.ws !== null) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000);
      }
      this.ws = null;
    }

    setTimeout(() => {
      this.connect(group);
    }, this.reconnectIntervalMs);
  }

  public connect(group: string = 'wxx') {
    if (this.ws !== null && this.ws.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${this.baseUrl}/group/${group}`);
    ws.onopen = () => {
    };
    ws.onerror = (ev) => {
      console.log(`[error] ${this.baseUrl}/group/${group}: `, ev);
    };
    ws.onclose = () => {
      this.reconnect(group);
    };
    ws.onmessage = (ev) => {
      this.onmessage(ev);
    };

    this.ws = ws;
  }

  public send(message: Uint8Array) {
    if (this.ws !== null && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }

  public sendAsync(message: Uint8Array) {
    return new Promise<void>((resolve, reject) => {
      if (this.ws === null || this.ws.readyState !== WebSocket.OPEN) {
        resolve();
      } else {
        try {
          this.send(message);
          resolve();
        } catch (e: unknown) {
          reject(e);
        }
      }
    });
  }
}
