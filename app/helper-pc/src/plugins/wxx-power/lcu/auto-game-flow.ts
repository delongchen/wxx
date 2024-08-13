import { lcuEventBus } from './app-listener'
import store from "@/store";
import { BallotLegacy, GameflowPhase, lcuFetch } from "tauri-plugin-wxx-core";


const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const playAgain = () => lcuFetch({
  method: 'post',
  endpoint: '/lol-lobby/v2/play-again'
})

enum MatchStage {
  Ready,
  WaitingForStats,
  PreEndOfGame,
  EndOfGame,
}

const NextStageMap = new Map<MatchStage, Set<MatchStage>>(
  [
    [MatchStage.Ready, new Set([])],
    [MatchStage.WaitingForStats, new Set([MatchStage.Ready])],
    [MatchStage.PreEndOfGame, new Set([MatchStage.WaitingForStats])],
    [MatchStage.EndOfGame, new Set([
      MatchStage.Ready,
      MatchStage.WaitingForStats,
      MatchStage.PreEndOfGame,
    ])],
  ]
)

const createMatchStageContext = () => {
  let matchStage = MatchStage.Ready
  let timer: number | null = null

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const reset = () => {
    matchStage = MatchStage.Ready
    clearTimer()
  }

  const resetTimer = (ms: number) => {
    clearTimer()
    timer = window.setTimeout(() => {
      playAgain().finally(reset)
    }, ms)
  }

  const isNextStage = (nextStage: MatchStage) => {
    return NextStageMap.get(nextStage)!.has(matchStage)
  }

  const next = (stage: MatchStage) => {
    const { autoNextMatch } = store.getState().wxxPower

    if (!isNextStage(stage)) return

    matchStage = stage

    if (autoNextMatch) {
      let timeout: number = 1500
      switch (matchStage) {
        case MatchStage.WaitingForStats: timeout = 10000; break
        case MatchStage.PreEndOfGame: timeout = 3000; break
        case MatchStage.EndOfGame: timeout = 1500; break
      }
      resetTimer(timeout)
    }
  }

  return {
    next,
    reset,
  }
}

const states = {
  accepting: false,
  matchStage: createMatchStageContext(),
}

const accept = async () => {
  const enable = store.getState().wxxPower.autoAcceptMatch

  if (!enable) return

  if (states.accepting) return
  states.accepting = true

  await sleep(200)
  await lcuFetch({
    method: 'post',
    endpoint: '/lol-matchmaking/v1/ready-check/accept'
  }).finally(() => {
    states.accepting = false
  })
}

const handleGameFlowPhase = (phase: GameflowPhase) => {
  console.log('phase: ', phase)

  if (phase === 'ReadyCheck') {
    return accept()
  }

  if (phase === 'Lobby') {
    states.matchStage.reset()
    return
  }

  if (
    phase === 'WaitingForStats' ||
    phase === 'PreEndOfGame' ||
    phase === 'EndOfGame'
  ) {
    states.matchStage.next(MatchStage[phase])
    return
  }
}

const handleMatchBallot = (ballot: BallotLegacy) => {
  const { autoBallot } = store.getState().wxxPower

  if (!autoBallot) return

  const { gameId } = ballot

  lcuFetch({
    method: 'post',
    endpoint: '/lol-honor-v2/v1/honor-player',
    body: {
      gameId,
      honorCategory: 'OPT_OUT',
      summonerId: 0
    }
  }).finally(() => {
    console.log('autoBallot: ', ballot)
  })
}

lcuEventBus.on(
  'match-ballot-create',
  handleMatchBallot,
)

lcuEventBus.on(
  'game-flow-phase-update',
  handleGameFlowPhase,
)
