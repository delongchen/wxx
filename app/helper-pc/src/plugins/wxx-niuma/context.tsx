import { createContext, use } from 'react';
import { LolChampionSummaries } from './apis/lol';
import { NiumaWorker } from './workers';
import { SummonerInfo } from 'tauri-plugin-wxx-core';


interface WxxNiumaContextType {
  theme: string,
  championSummaries: LolChampionSummaries,
  currentSummoner: SummonerInfo | null,
  niumaWorker: NiumaWorker
}

export const WxxNiumaContext = createContext<WxxNiumaContextType>({
  theme: 'gray',
  championSummaries: null!,
  currentSummoner: null,
  niumaWorker: null!,
});

export const useNiumaContext = () => use(WxxNiumaContext);
