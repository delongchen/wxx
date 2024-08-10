import { lcuFetch, LcuEventHandler } from "tauri-plugin-wxx-core";


const createAutoAcceptHandler = (): LcuEventHandler => {
  const autoAccept: LcuEventHandler = {
    name: 'auto-accept-match',
    active: false,
    handle: (ev) => {
      console.log(ev)
    }
  }

  return autoAccept
}

const createAutoNextHandler = (): LcuEventHandler => {


  return {
    name: 'auto-next-match',
    active: false,
    handle: ev => {
      if (
        ev.uri === '/lol-gameflow/v1/gameflow-phase' &&
        ev.eventType === 'Update' &&
        ev.data === 'EndOfGame'
      ) {
        lcuFetch({endpoint: '/lol-lobby/v2/play-again', method: 'post'})
      }
    }
  }
}

export const autoAcceptHandler = createAutoAcceptHandler()
export const autoNextHandler = createAutoNextHandler()
