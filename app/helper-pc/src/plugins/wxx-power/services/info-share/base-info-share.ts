import { currentSummonerUpdateStream, gameFlowPhaseStream } from '../../lcu/event-stream';
import { LcuProcessStatus } from 'tauri-plugin-wxx-core/events';
import { GameflowPhase, SummonerInfo } from 'tauri-plugin-wxx-core';
import { getCurrentSummoner } from 'tauri-plugin-wxx-core/lcu-api/summoner';
import { getGameflowPhase } from 'tauri-plugin-wxx-core/lcu-api/gameflow';
import { GameflowPhaseEnum, PhaseWithSummonerId, GamePhaseSharingServiceName } from 'wxx-protobufs/lcu.gameflow';
import { SummonerInfoBody, SummonerSharingServiceName } from 'wxx-protobufs/lcu.summoner'
import { createSubscriptionManager, createMapHelper } from '../utils';
import { Subject } from 'rxjs';
import { shareChannel } from './share-channel';
import { lcuProcessStatusBus } from '../../lcu/process';

export interface SummonerState {
  info: SummonerInfoBody;
  phase: GameflowPhaseEnum;
}

let currentSummoner: SummonerInfo | null = null;

export const summonerMapChange = new Subject<void>();
const emitMapChange = () => summonerMapChange.next();

export const summonerStateMap: Map<number, SummonerState> = new Map();
const stateMapHelper = createMapHelper(summonerStateMap);

const getPhaseWithPhase = (raw?: GameflowPhase): PhaseWithSummonerId | undefined => {
  if (currentSummoner === null) return;

  return {
    summonerId: currentSummoner.summonerId,
    phase: raw === undefined ? GameflowPhaseEnum.UNRECOGNIZED : GameflowPhaseEnum[raw],
  };
};

const handleSummonerInfo = (info: SummonerInfo) => currentSummoner = info;

const fetchGroupSummoners = (): Promise<SummonerState[]> =>
  fetch('http://localhost:11460/summoners', { method: 'GET' })
    .then(res => res.json())
    .catch(() => []);

const refreshSummoners = () => {
  fetchGroupSummoners()
    .then(states => {
      for (const state of states) {
        summonerStateMap.set(state.info.summonerId, state);
      }
    })
    .then(emitMapChange);
};

export default () => {
  const { subscribe, quit, manage, defer } = createSubscriptionManager();

  refreshSummoners();

  const summonerChan = shareChannel(SummonerSharingServiceName, SummonerInfoBody);
  defer(summonerChan.stop);
  manage(
    summonerChan.sendOn(currentSummonerUpdateStream, handleSummonerInfo),
    summonerChan.receive(info => {
      stateMapHelper.need(
        info.summonerId,
        state => {
          state.info = info;
        },
        setter => setter({ info, phase: GameflowPhaseEnum.None }),
      );
      emitMapChange();
    }),
  );

  const phaseChan = shareChannel(GamePhaseSharingServiceName, PhaseWithSummonerId);
  defer(phaseChan.stop);
  manage(
    phaseChan.sendOn(gameFlowPhaseStream, getPhaseWithPhase),
    phaseChan.receive(message => {
      stateMapHelper.need(message.summonerId, state => {
        if (message.phase !== state.phase) {
          state.phase = message.phase;
          emitMapChange();
        }
      });
    }),
  );

  subscribe(lcuProcessStatusBus, async status => {
    if (status === LcuProcessStatus.Started) {
      await getCurrentSummoner().then(handleSummonerInfo).then(summonerChan.send);
      await getGameflowPhase().then(getPhaseWithPhase).then(phaseChan.send);
    } else {
      phaseChan.send(getPhaseWithPhase()).catch(() => console.log('lol exit.'));

      currentSummoner = null;
    }
  });

  return quit;
};
