import { Channel, invoke } from '@tauri-apps/api/core';
import { resolveCmdName } from '../resolve';

const CMD_SYNC_GAMES_BY_PUUID = resolveCmdName("sync_games_by_puuid")

const enum TaskCode {
  Created,
  End,
  History,
  Detail,
}

interface TaskMessage {
  code: TaskCode,
  data: unknown,
}

export interface SyncGameHistoryTaskEventListener {
  taskCreated: (puuid: string) => void
  taskEnd: (endStatus: number) => void
  fetchHistoryStart: () => void
  fetchHistoryProcessing: (start: number, end: number) => void
  fetchHistoryEnd: (all: number) => void
  fetchDetailStart: () => void
  fetchDetailProcessing: (fetched: number, all: number) => void
  fetchDetailEnd: (full: boolean) => void
}

export const syncGamesByPuuid = async (
  puuid: string,
  listener: Partial<SyncGameHistoryTaskEventListener>,
) => {
  const channel = new Channel<TaskMessage>()

  channel.onmessage = ({code, data}) => {
    switch (code) {
      case TaskCode.Created: {
        const { puuid } = data as { puuid: string }

        listener.taskCreated && listener.taskCreated(puuid)

        return;
      }
      case TaskCode.End: {
        const { status } = data as { status: number }

        listener.taskEnd && listener.taskEnd(status)

        return;
      }
      case TaskCode.History: {
        const { status: fetchingHistoryStatus, value } = data as { status: number, value: unknown }

        switch (fetchingHistoryStatus) {
          case 0: {
            listener.fetchHistoryStart && listener.fetchHistoryStart()
            break
          }
          case 1: {
            const { start_index, end_index } = value as { start_index: number, end_index: number }
            listener.fetchHistoryProcessing && listener.fetchHistoryProcessing(start_index, end_index)
            break
          }
          case 2: {
            const { all } = value as { all: number }
            listener.fetchHistoryEnd && listener.fetchHistoryEnd(all)
            break
          }
          default: break
        }

        return;
      }
      case TaskCode.Detail: {
        const { status: fetchingGameDetailStatus, value } = data as { status: number, value: unknown }

        switch (fetchingGameDetailStatus) {
          case 0: {
            listener.fetchDetailStart && listener.fetchDetailStart()
            break
          }
          case 1: {
            const { fetched, tasks } = value as { fetched: number, tasks: number }
            listener.fetchDetailProcessing && listener.fetchDetailProcessing(fetched, tasks)
            break
          }
          case 2: {
            const { full } = value as { full: boolean }
            listener.fetchDetailEnd && listener.fetchDetailEnd(full)
            break
          }
          default: break
        }

        return;
      }
      default: {
        return;
      }
    }
  }

  return await invoke<null>(CMD_SYNC_GAMES_BY_PUUID, {
    puuid,
    chan: channel,
  })
}
