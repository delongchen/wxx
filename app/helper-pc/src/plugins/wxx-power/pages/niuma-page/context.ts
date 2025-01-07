import { createContext } from 'react';
import { SummonerInfo } from 'tauri-plugin-wxx-core';

export interface NiumaContextType {
  theme: string;
  summoner: SummonerInfo | null;
}

export const NiumaContext = createContext<NiumaContextType>({
  theme: 'gary',
  summoner: null,
});
