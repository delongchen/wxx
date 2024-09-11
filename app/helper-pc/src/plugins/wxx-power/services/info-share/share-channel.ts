import { WxxWebSocket } from '../../ws/native';
import { Subject, Observable } from 'rxjs';
import { BasicMessage } from 'wxx-protobufs/common';
import { BinaryReader, BinaryWriter } from '@bufbuild/protobuf/wire';

interface Serializer<T = unknown> {
  encode: (message: T, writer?: BinaryWriter) => BinaryWriter;
  decode: (input: BinaryReader | Uint8Array, length?: number) => T;
}

const isBlob = (value: unknown): value is Blob => value instanceof Blob;

export const incomingChannel = new Subject<BasicMessage>();

let enable = true;
export const setEnable = (value: boolean) => {
  enable = value;
};

const ws = new WxxWebSocket('ws://localhost:11460');
ws.onmessage = async ev => {
  if (!enable) return;

  const data = ev.data;
  if (isBlob(data)) {
    const view = new Uint8Array(await data.arrayBuffer());
    const message = BasicMessage.decode(view);
    if (message.header?.endpoint !== undefined) {
      incomingChannel.next(message);
    }
  }
};
ws.connect();

export const shareWithEndpoint = (endpoint: string, body: Uint8Array) => {
  if (!enable) return Promise.resolve();

  return ws.sendAsync(
    BasicMessage.encode({
      body,
      header: { endpoint },
    }).finish(),
  );
};

export const shareChannel = <T>(endpoint: string, serializer: Serializer<T>) => {
  const subject = new Subject<T>();
  const subscription = incomingChannel.subscribe(message => {
    if (message.header?.endpoint === endpoint) {
      try {
        const data = serializer.decode(message.body);
        subject.next(data);
      } catch (e: unknown) {
        /* do nothing */
      }
    }
  });

  const send = (message: T | undefined) => {
    if (message === undefined) return Promise.resolve();

    return shareWithEndpoint(endpoint, serializer.encode(message).finish());
  };

  const sendOn = <M = T>(
    outlet: Observable<M>,
    adapter: (source: M) => T | undefined
  ) => outlet.subscribe(source => {
    const result = adapter(source);

    if (result !== undefined) {
      send(result);
    }
  });

  const receive = (handler: (message: T) => void) => {
    return subject.subscribe(handler);
  };

  const stop = () => {
    subscription.unsubscribe();
    subject.complete();
  };

  return {
    send,
    sendOn,
    receive,
    stop,
  };
};
