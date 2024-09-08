import { WebSocket } from 'ws';
import { IncomingMessage } from 'node:http';
import { handleIncomingMessage } from '../services/sharing';
import { ResponseTarget } from '../services/sharing/types'

const HeartbeatInterval = 1000 * 10;

interface ConnectionInfo {
  timer: NodeJS.Timeout;
  port: number;
  ip: string;
}

const sendAsync = async (ws: WebSocket, data: Uint8Array) => {
  return new Promise<void>((resolve, reject) => {
    if (ws.readyState === 1) {
      ws.send(data, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      reject(new Error('connection not opened'));
    }
  });
};

export const groupMap: Map<string, WxxGroup> = new Map();

export class WxxGroup {
  private readonly connections: Map<WebSocket, ConnectionInfo> = new Map();

  constructor(public readonly groupName: string) {}

  private initConnection(ws: WebSocket) {
    ws.on('close', () => this.remove(ws));
    ws.on('error', () => this.remove(ws));
    ws.on('pong', () => this.reset(ws));
    ws.on('message', (message: Buffer, isBinary) => {
      if (!isBinary) return;

      handleIncomingMessage(message)
        .then(res => {
          if (res === null) return;
          return this.sendTo(ws, res.target, res.bytes);
        })
        .catch(console.error);
    });
  }

  public manage(ws: WebSocket, req: IncomingMessage) {
    const ip = req.socket.remoteAddress;
    const port = req.socket.remotePort;

    this.initConnection(ws);
    this.add(ws, ip ?? '', port ?? 0);
  }

  private timerOf(ws: WebSocket) {
    return setInterval(() => {
      if (ws.readyState === 1) {
        ws.ping();
      } else {
        this.remove(ws);
      }
    }, HeartbeatInterval);
  }

  private add(ws: WebSocket, ip: string, port: number) {
    console.log('new connection: ', ip, port);

    this.connections.set(ws, {
      timer: this.timerOf(ws),
      port,
      ip,
    });
  }

  private remove(ws: WebSocket) {
    const exist = this.connections.get(ws);
    if (exist !== undefined) {
      clearInterval(exist.timer);
      this.connections.delete(ws);
      console.log('removed', exist.ip, exist.port);
    }
  }

  private reset(ws: WebSocket) {
    const exist = this.connections.get(ws);
    if (exist !== undefined) {
      clearInterval(exist.timer);
      exist.timer = this.timerOf(ws);
    }
  }

  public sendTo(self: WebSocket, target: ResponseTarget, data: Uint8Array) {
    if (this.connections.size === 0) {
      return;
    }

    if (target === ResponseTarget.All) {
      for (const connection of this.connections.keys()) {
        sendAsync(connection, data);
      }
    } else if (target === ResponseTarget.Others) {
      for (const connection of this.connections.keys()) {
        if (connection !== self) {
          sendAsync(connection, data);
        }
      }
    } else if (target === ResponseTarget.Self) {
      sendAsync(self, data);
    }
  }

  public async broadcast(data: Uint8Array) {
    for (const connection of this.connections.keys()) {
      sendAsync(connection, data);
    }
  }
}

export const createGroup = (name: string) => {
  if (!groupMap.has(name)) {
    groupMap.set(name, new WxxGroup(name));
  }
};
