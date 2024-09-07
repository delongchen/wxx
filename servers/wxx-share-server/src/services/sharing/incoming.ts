import {BinaryReader, BinaryWriter} from "@bufbuild/protobuf/wire";
import { BasicMessage } from 'wxx-protobufs/common'
import { SimpleLobbyInfo } from 'wxx-protobufs/lcu'


interface Serializer<T = unknown> {
  encode: (message: T, writer?: BinaryWriter) => BinaryWriter;
  decode: (input: BinaryReader | Uint8Array, length?: number) => T;
}

interface MessageContext {

}

export const createMapHelper = <K, V>(map: Map<K, V>) => {
  const need = (
    key: K,
    exist: (value: V, setter: (value: V) => void) => void,
    not?: (setter: (value: V) => void) => void,
  ) => {
    const target = map.get(key);
    const setter = (value?: V) => {
      if (value === undefined) {
        map.delete(key);
        return;
      }

      map.set(key, value);
    };

    if (target !== undefined) {
      exist(target, setter);
    } else if (not !== undefined) {
      not(setter);
    }
  };

  return {
    need,
  };
};

const lobbyMap = new Map<string, SimpleLobbyInfo>()
const lobbyMapHelper = createMapHelper(lobbyMap)

const handleIncomingMessage = (buf: Buffer) => {
  const message = BasicMessage.decode(buf)

  const endpoint = message.header?.endpoint

  if (endpoint === undefined) return null;

  if (endpoint === '') {
    const lobbyInfo = SimpleLobbyInfo.decode(message.body)

    lobbyMapHelper.need(
      lobbyInfo.partyId,
      (lobby, setter) => {

      },
      setter => setter(lobbyInfo)
    )
  }
}
