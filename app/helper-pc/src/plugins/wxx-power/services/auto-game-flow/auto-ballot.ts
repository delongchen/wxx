import { gameBallotStream } from '../../lcu/event-stream';
import { BallotLegacy } from 'tauri-plugin-wxx-core';
import { lcuFetch } from 'tauri-plugin-wxx-core/api';
import store from '@/store';

const handleBallot = async (matchInfo: BallotLegacy) => {
  const enable = store.getState().wxxPower.autoBallot;
  if (!enable) return;

  const { gameId } = matchInfo;

  await lcuFetch({
    method: 'post',
    endpoint: '/lol-honor-v2/v1/honor-player',
    body: {
      gameId,
      honorCategory: 'OPT_OUT',
      summonerId: 0,
    },
  });
};

export const startAutoBallot = () => {
  const subscription = gameBallotStream.subscribe(handleBallot);

  return () => subscription.unsubscribe();
};
