import { createSubscriptionManager } from '../utils';
import { shareChannel } from './share-channel';
import { SimpleLobbyInfo } from 'wxx-protobufs/lcu.lobby';
import { createSubStream } from '../../lcu/event-stream';
import { Lobby } from 'tauri-plugin-wxx-core';
import { debounceTime } from 'rxjs';

export default () => {
  const { quit, manage, defer } = createSubscriptionManager();

  const lobbyStream = createSubStream<Lobby | null>('/lol-lobby/v2/lobby', ['All'], false).pipe(
    debounceTime(1500)
  );

  const lobbyChan = shareChannel('share-lobby', SimpleLobbyInfo);
  defer(lobbyChan.stop);
  manage(
    lobbyChan.sendOn(lobbyStream, () => undefined),
    lobbyChan.receive(console.log)
  );

  return quit;
};
