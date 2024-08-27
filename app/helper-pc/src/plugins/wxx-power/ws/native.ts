import { Subject } from 'rxjs';
import { BasicMessage } from 'wxx-protobufs/common';

const isBlob = (value: unknown): value is Blob => {
  return value instanceof Blob;
};

export const socketMessageSubject = new Subject<{
  endpoint: string;
  body: Uint8Array;
}>();

const handleMessage = async (data: Blob) => {
  const view = new Uint8Array(await data.arrayBuffer());
  const message = BasicMessage.decode(view);

  if (message.header?.endpoint !== undefined) {
    socketMessageSubject.next({
      endpoint: message.header.endpoint,
      body: message.body,
    });
  }
};

export class WxxWebSocket {
  private ws: WebSocket | null = null;

  constructor(
    private baseUrl: string,
    private reconnectIntervalMs: number = 3000,
  ) {}

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
    ws.onopen = () => {};
    ws.onerror = ev => {
      console.log(`[error] ${this.baseUrl}/group/${group}: `, ev);
    };
    ws.onclose = () => {
      this.reconnect(group);
    };
    ws.onmessage = ev => {
      const data = ev.data;
      if (isBlob(data)) {
        handleMessage(data).catch(console.error);
      }
    };

    this.ws = ws;
  }

  public send(message: Uint8Array) {
    if (this.ws !== null && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }

  public sendTo(endpoint: string, body: Uint8Array) {
    this.send(
      BasicMessage.encode({
        header: { endpoint },
        body,
      }).finish(),
    );
  }
}

export const ws = new WxxWebSocket('ws://localhost:11460');
ws.connect();
