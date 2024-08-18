import { gameFlowPhaseStream } from "../../lcu/event-stream";
import { filter, debounceTime } from 'rxjs'
import store from "@/store";
import { lcuFetch } from "tauri-plugin-wxx-core";

const gameReadyCheckStream = gameFlowPhaseStream
  .pipe(
    filter(phase => phase === 'ReadyCheck'),
    debounceTime(200),
  )

const accept = async () => {
  const enable = store.getState().wxxPower.autoAcceptMatch

  if (enable) {
    await lcuFetch({
      method: 'post',
      endpoint: '/lol-matchmaking/v1/ready-check/accept'
    })
  }
}

export const startAutoAccept = () => {
  const subscription = gameReadyCheckStream
    .subscribe(accept)

  return () => subscription.unsubscribe()
}
