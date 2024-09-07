import { createMapHelper, createSubscriptionManager } from '../utils';
import { shareChannel } from './share-channel';
import { SimpleLobbyInfo } from 'wxx-protobufs/lcu';
import { createSubStream } from '../../lcu/event-stream';
import { Lobby } from 'tauri-plugin-wxx-core';
import { debounceTime, Subject } from 'rxjs';

const lobbyMapChange = new Subject<void>();
const lobbyMap = new Map<string, SimpleLobbyInfo>();
const lobbyMapHelper = createMapHelper(lobbyMap);

const handleLcuLobby = (lobby: Lobby | null): SimpleLobbyInfo | undefined => {
  if (lobby === null) {
    return undefined;
  }

  return {
    partyId: lobby.partyId,
    memberMap: Object.fromEntries(lobby.members.map(member => [member.summonerId, member])),
  };
};

export default () => {
  const { quit, manage, defer } = createSubscriptionManager();

  const lobbyStream = createSubStream<Lobby | null>('/lol-lobby/v2/lobby', ['All'], false).pipe(
    debounceTime(1500),
  );

  const lobbyChan = shareChannel('share-lobby', SimpleLobbyInfo);
  defer(lobbyChan.stop);
  manage(
    lobbyChan.sendOn(lobbyStream, handleLcuLobby),
    lobbyChan.receive(lobby => {
      lobbyMapHelper.need(
        lobby.partyId,
        curLobby => {
          lobbyMapChange.next();
        },
        setter => {
          setter(lobby);
          lobbyMapChange.next();
        },
      );
    }),
  );

  return quit;
};
