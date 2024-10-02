import { filter, switchMap, of, timer } from 'rxjs';
import { GameflowPhase } from 'tauri-plugin-wxx-core';
import { playAgain } from 'tauri-plugin-wxx-core/lcu-api/lobby';
import { gameFlowPhaseStream } from '../../lcu/event-stream';
import store from '@/store';

type SubGamePhase<T extends GameflowPhase> = T;
type AllowedPhase = SubGamePhase<
  'WaitingForStats' | 'PreEndOfGame' | 'EndOfGame' | 'Lobby' | 'None'
>;

const allowedPhaseSet = new Set<AllowedPhase>([
  'WaitingForStats',
  'PreEndOfGame',
  'EndOfGame',
  'Lobby',
  'None',
]);

const doPlayAgain = () => {
  if (!store.getState().wxxPower.autoNextMatch) return;

  playAgain();
};

const isAllowedPhase = (phase: string): phase is AllowedPhase =>
  allowedPhaseSet.has(phase as AllowedPhase);

export const startAutoPlayAgain = () => {
  const subscription = gameFlowPhaseStream
    .pipe(
      filter(isAllowedPhase),
      switchMap((phase) => {
        switch (phase) {
          case 'WaitingForStats':
            return timer(10000);
          case 'PreEndOfGame':
            return timer(3000);
          case 'EndOfGame':
            return timer(3000);
        }

        return of();
      })
    )
    .subscribe(doPlayAgain);

  return () => subscription.unsubscribe();
};
