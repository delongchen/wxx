import { currentSummonerUpdateStream, gameFlowPhaseStream } from '../../lcu/event-stream';
import { LcuProcessStatus, processStatusStream } from 'tauri-plugin-wxx-core/events';
import { GameflowPhase, SummonerInfo } from 'tauri-plugin-wxx-core';
import { getCurrentSummoner } from 'tauri-plugin-wxx-core/lcu-api/summoner';
import { getGameflowPhase } from 'tauri-plugin-wxx-core/lcu-api/gameflow';
import { GameflowPhaseEnum, PhaseWithSummonerId, SummonerInfoBody } from 'wxx-protobufs/lcu';
import { createSubscriptionManager, createMapHelper } from '../utils';
import { Subject } from 'rxjs';
import { shareChannel } from './share-channel';

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
    phase: raw === undefined ?
      GameflowPhaseEnum.UNRECOGNIZED
      :
      GameflowPhaseEnum[raw],
  }
}

const handleSummonerInfo = (info: SummonerInfo) => {
  currentSummoner = info;
  return info;
}

const fetchGroupSummoners = (): Promise<SummonerState[]> =>
  fetch('http://localhost:11460/summoners', { method: 'GET' })
    .then(res => res.json())
    .catch(() => []);

const enum Endpoints {
  ShareSummoner = 'share-summoner',
  SharePhase = 'share-phase',
}

const refreshSummoners = () => {
  fetchGroupSummoners().then(states => {
    for (const state of states) {
      summonerStateMap.set(state.info.summonerId, state);
    }
  }).then(emitMapChange);
};

export const baseInfoShare = () => {
  const { subscribe, quit, manage, defer } = createSubscriptionManager();

  refreshSummoners();

  const summonerChan = shareChannel(Endpoints.ShareSummoner, SummonerInfoBody);
  defer(summonerChan.stop)
  manage(
    summonerChan.sendOn(currentSummonerUpdateStream, handleSummonerInfo),
    summonerChan.receive(info => {
      stateMapHelper.need(
        info.summonerId,
        state => { state.info = info; },
        () => ({ info, phase: GameflowPhaseEnum.None }),
      );
      emitMapChange();
    }),
  );

  const phaseChan = shareChannel(Endpoints.SharePhase, PhaseWithSummonerId);
  defer(phaseChan.stop)
  manage(
    phaseChan.sendOn(gameFlowPhaseStream, getPhaseWithPhase),
    phaseChan.receive(message => {
      stateMapHelper.need(
        message.summonerId,
        state => {
          if (message.phase !== state.phase) {
            state.phase = message.phase;
            emitMapChange();
          }
        },
      );
    }),
  );

  subscribe(processStatusStream, async status => {
    if (status === LcuProcessStatus.Started) {
      await getCurrentSummoner()
        .then(handleSummonerInfo)
        .then(summonerChan.send);

      await getGameflowPhase()
        .then(getPhaseWithPhase)
        .then(phaseChan.send);
    } else {
      phaseChan.send(getPhaseWithPhase());
      currentSummoner = null;
    }
  });

  return quit;
};
