import { gameFlowPhaseStream } from '../../lcu/event-stream';
import { filter, debounceTime } from 'rxjs';
import store from '@/store';
import { accept } from 'tauri-plugin-wxx-core/lcu-api/match-making';

const gameReadyCheckStream = gameFlowPhaseStream.pipe(
  filter((phase) => phase === 'ReadyCheck'),
  debounceTime(200)
);

export const startAutoAccept = () => {
  const subscription = gameReadyCheckStream.subscribe(() => {
    if (store.getState().wxxPower.autoAcceptMatch) {
      accept();
    }
  });

  return () => subscription.unsubscribe();
};
