import {
  BallotLegacy,
  GameflowPhase,
  LcuEventEmitter,
  SummonerInfo,
} from "tauri-plugin-wxx-core";

interface WxxPowerEvent {
  'game-flow-phase-update': GameflowPhase,
  'current-summoner-update': SummonerInfo,
  'match-ballot-create': BallotLegacy,
}

const lcuEventBus = new LcuEventEmitter<WxxPowerEvent>()

lcuEventBus.registerAdapter(
  'game-flow-phase',
  (ev, emit) => {
    if (
      ev.uri === '/lol-gameflow/v1/gameflow-phase' &&
      ev.eventType === 'Update'
    ) {
      emit('game-flow-phase-update', ev.data as GameflowPhase)
    }
  }
)

lcuEventBus.registerAdapter(
  'current-summoner',
  (ev, emit) => {
    if (
      ev.uri === '/lol-summoner/v1/current-summoner' &&
      ev.eventType === 'Update'
    ) {
      emit('current-summoner-update', ev.data as SummonerInfo)
    }
  }
)

lcuEventBus.registerAdapter(
  'game-ballot',
  (ev, emit) => {
    if (
      ev.uri === '/lol-honor-v2/v1/ballot' &&
      ev.eventType === 'Create'
    ) {
      emit('match-ballot-create', ev.data as BallotLegacy)
    }
  }
)

export {
  lcuEventBus,
}
