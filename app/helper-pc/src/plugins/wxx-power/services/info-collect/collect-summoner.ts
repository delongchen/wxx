import { currentSummonerUpdateStream, gameFlowPhaseStream } from '../../lcu/event-stream';
import { socketMessageSubject, ws } from '../../ws/native';
import { LcuProcessStatus, processStatusStream } from 'tauri-plugin-wxx-core/events';
import { GameflowPhase, SummonerInfo } from 'tauri-plugin-wxx-core';
import { lcuFetch } from 'tauri-plugin-wxx-core/api';
import { GameflowPhaseEnum, PhaseWithSummonerId, SummonerInfoBody } from 'wxx-protobufs/lcu';
import { createStreamHelper } from '../utils';
import { Subject } from 'rxjs';

export interface SummonerState {
  info: SummonerInfoBody;
  phase: GameflowPhaseEnum;
}

let enableService = true;
let currentSummoner: SummonerInfo | null = null;
export const summonerMapChange = new Subject<void>();
export const summonerStateMap: Map<number, SummonerState> = new Map();

const enum Endpoints {
  UpdateSummoner = 'update-summoner',
  UpdatePhase = 'update-phase',
}

const refreshSummoners = () => {
  fetch('http://localhost:11460/summoners', { method: 'GET' })
    .then(res => res.json() as Promise<SummonerState[]>)
    .then(states => {
      for (const state of states) {
        summonerStateMap.set(state.info.summonerId, state);
      }
      summonerMapChange.next();
    });
};

const updateAndSendInfo = (info: SummonerInfo) => {
  currentSummoner = info;
  ws.sendTo(Endpoints.UpdateSummoner, SummonerInfoBody.encode(info).finish());
};

const sendPhase = (phase?: GameflowPhase) => {
  if (currentSummoner === null) return;

  ws.sendTo(
    Endpoints.UpdatePhase,
    PhaseWithSummonerId.encode({
      summonerId: currentSummoner.summonerId,
      phase: phase === undefined ? GameflowPhaseEnum.UNRECOGNIZED : GameflowPhaseEnum[phase],
    }).finish(),
  );
};

const handleRemoteMessage = (message: { endpoint: string; body: Uint8Array }) => {
  const { endpoint, body } = message;

  switch (endpoint) {
    case Endpoints.UpdateSummoner: {
      const info = SummonerInfoBody.decode(body);

      const existSummoner = summonerStateMap.get(info.summonerId);

      if (existSummoner === undefined) {
        summonerStateMap.set(info.summonerId, {
          info,
          phase: GameflowPhaseEnum.Lobby,
        });
      } else {
        existSummoner.info = info;
      }

      summonerMapChange.next();

      return;
    }
    case Endpoints.UpdatePhase: {
      const { summonerId, phase } = PhaseWithSummonerId.decode(body);

      const existSummoner = summonerStateMap.get(summonerId);

      if (existSummoner !== undefined) {
        if (phase !== existSummoner.phase) {
          existSummoner.phase = phase;
          summonerMapChange.next();
        }
      }

      return;
    }
  }
};

export const collectSummoner = () => {
  const { subscribe, quit } = createStreamHelper(() => enableService);

  if (enableService) {
    refreshSummoners();
  }

  subscribe(currentSummonerUpdateStream, updateAndSendInfo);

  subscribe(gameFlowPhaseStream, sendPhase);

  subscribe(processStatusStream, async status => {
    if (status === LcuProcessStatus.Started) {
      await lcuFetch<SummonerInfo>({
        endpoint: '/lol-summoner/v1/current-summoner',
        method: 'get',
      }).then(updateAndSendInfo);

      await lcuFetch<GameflowPhase>({
        endpoint: '/lol-gameflow/v1/gameflow-phase',
        method: 'get',
      }).then(sendPhase);
    } else {
      sendPhase();
      currentSummoner = null;
    }
  });

  subscribe(socketMessageSubject, handleRemoteMessage);

  return quit;
};
