import { SummonerInfo } from 'tauri-plugin-wxx-core';

export type WorkerInvokeFn = <T, P = unknown>(cmd: string, payload?: P) => Promise<T>

export interface NiumaContextType {
  theme: string;
  currentSummoner: SummonerInfo | null;
  invoke: WorkerInvokeFn;
}
