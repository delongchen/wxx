import { gameBallotStream } from '../../lcu/event-stream';
import { BallotLegacy } from 'tauri-plugin-wxx-core';
import { honor } from 'tauri-plugin-wxx-core/lcu-api/honor-v2'
import store from '@/store';

const handleBallot = async (matchInfo: BallotLegacy) => {
  const enable = store.getState().wxxPower.autoBallot;
  if (!enable) return;

  const { gameId } = matchInfo;

  await honor({
    gameId,
    honorCategory: 'OPT_OUT',
    summonerId: 0,
  });
};

export const startAutoBallot = () => {
  const subscription = gameBallotStream.subscribe(handleBallot);

  return () => subscription.unsubscribe();
};
