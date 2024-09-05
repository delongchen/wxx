import { createMapHelper, createSubscriptionManager } from '../utils';
import { shareChannel } from './share-channel';
import { SimpleLobbyInfo } from 'wxx-protobufs/lcu';
import { lobbyStream } from '../../lcu/event-stream';
import { Lobby } from 'tauri-plugin-wxx-core';

const lobbyMap = new Map<string, SimpleLobbyInfo>();
const lobbyMapHelper = createMapHelper(lobbyMap);

const handleLcuLobby = (lobby: Lobby | null): SimpleLobbyInfo | undefined => {
  if (lobby === null) {
    return undefined;
  }

  return lobby;
};

export default () => {
  const { quit, manage } = createSubscriptionManager();

  const lobbyChan = shareChannel('share-lobby', SimpleLobbyInfo);
  manage(
    lobbyChan.sendOn(lobbyStream, handleLcuLobby),
    lobbyChan.receive(lobby => {
      lobbyMapHelper.need(lobby.partyId, exists => {
        console.log(exists);
      });
    }),
  );

  return quit;
};
