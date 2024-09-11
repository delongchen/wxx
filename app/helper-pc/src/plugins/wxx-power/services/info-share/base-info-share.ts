import { currentSummonerUpdateStream, gameFlowPhaseStream } from '../../lcu/event-stream';
import { LcuProcessStatus } from 'tauri-plugin-wxx-core/events';
import { GameflowPhase, SummonerInfo } from 'tauri-plugin-wxx-core';
import { getCurrentSummoner } from 'tauri-plugin-wxx-core/lcu-api/summoner';
import { getGameflowPhase } from 'tauri-plugin-wxx-core/lcu-api/gameflow';
import { GameflowPhaseEnum, PhaseWithSummonerId, GamePhaseSharingServiceName } from 'wxx-protobufs/lcu.gameflow';
import { SummonerInfoRaw, SummonerSharingServiceName } from 'wxx-protobufs/lcu.summoner'
import { createSubscriptionManager, createMapHelper } from '../utils';
import { Subject } from 'rxjs';
import { shareChannel } from './share-channel';
import { lcuProcessStatusBus } from '../../lcu/process';

export interface SummonerState {
  info: SummonerInfoRaw;
  phase: GameflowPhaseEnum;
}

let currentSummoner = 0

export const summonerMapChange = new Subject<void>();
const emitMapChange = () => summonerMapChange.next();

export const summonerStateMap: Map<number, SummonerState> = new Map();
const stateMapHelper = createMapHelper(summonerStateMap);

const getPhaseWithSummonerId = (raw?: GameflowPhase): PhaseWithSummonerId | undefined => {
  if (currentSummoner === 0) return;

  return {
    summonerId: currentSummoner,
    phase: raw === undefined ? GameflowPhaseEnum.UNRECOGNIZED : GameflowPhaseEnum[raw],
  };
};

const handleSummonerInfo = (info: SummonerInfo): SummonerInfoRaw => {
  currentSummoner = info.summonerId;
  return {
    base: info,
    rerollPoints: info.rerollPoints,
  }
}

export default () => {
  const { subscribe, quit, manage, defer } = createSubscriptionManager();

  const summonerChan = shareChannel(SummonerSharingServiceName, SummonerInfoRaw);
  defer(summonerChan.stop);
  manage(
    summonerChan.sendOn(currentSummonerUpdateStream, handleSummonerInfo),
    summonerChan.receive(info => {
      if (info.base === undefined) return

      stateMapHelper.need(
        info.base.summonerId,
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
    phaseChan.sendOn(gameFlowPhaseStream, getPhaseWithSummonerId),
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
      await getGameflowPhase().then(getPhaseWithSummonerId).then(phaseChan.send);
    } else {
      phaseChan.send(getPhaseWithSummonerId()).catch(() => console.log('lol exit.'));
      currentSummoner = 0;
    }
  });

  return quit;
};
