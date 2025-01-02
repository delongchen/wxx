import { createContext } from 'react';
import { NiumaContextType } from './types';

const defaultContext: NiumaContextType = {
  theme: 'gray',
  currentSummoner: null,
  invoke: () => Promise.reject(),
  latestVersion: '14.24.1',
  champions: null,
};

export const NiumaContext = createContext<NiumaContextType>(defaultContext);
