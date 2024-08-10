import {GameflowPhase} from "../types/lcu-api/gameflow";
import {LcuEventType} from "../events/wxx-core";

export const isGameflowPhaseEvent = (ev: LcuEventType):
  ev is LcuEventType<GameflowPhase> =>
    ev.uri === '/lol-gameflow/v1/gameflow-phase'
