import {BinaryReader, BinaryWriter} from "@bufbuild/protobuf/wire";

export const enum ResponseTarget {
  All,
  Others,
  Self,
}

export interface ResponseMessage {
  target: ResponseTarget,
  bytes: Uint8Array,
}

export interface Serializer<T = unknown> {
  encode: (message: T, writer?: BinaryWriter) => BinaryWriter;
  decode: (input: BinaryReader | Uint8Array, length?: number) => T;
}

export interface Context<T> {
  data: T;
  broadcast: (data?: T) => void;
  result?: T;
  target?: ResponseTarget;
}

export type ContextHandler<T> = (ctx: Context<T>) => void | Promise<void>;

export interface Middleware<T = unknown> {
  endpoint: string,
  serializer: Serializer<T>,
  handler: ContextHandler<T>,
}
