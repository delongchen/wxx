import { createContext } from 'react';
import { NiumaContextType } from './types';

const defaultContext: NiumaContextType = {
  theme: 'gray',
  currentSummoner: null,
  invoke: () => Promise.reject()
};

export const NiumaContext = createContext<NiumaContextType>(defaultContext);
