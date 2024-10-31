import { SummonerInfo } from 'tauri-plugin-wxx-core'


export interface NiumaContextType {
  theme: string;
  currentSummoner: SummonerInfo | null
}
