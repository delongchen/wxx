import { createContext } from 'react';
import { SummonerInfo } from 'tauri-plugin-wxx-core';

interface NiumaContextType {
  theme: string;
  currentSummoner: SummonerInfo | null;
}

const defaultContext: NiumaContextType = {
  theme: 'gray',
  currentSummoner: null,
};

export const NiumaContext = createContext<NiumaContextType>(defaultContext);
