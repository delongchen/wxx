import { createContext } from 'react';
import { NiumaContextType } from './types';

const defaultContext: NiumaContextType = {
  theme: 'gray',
  currentSummoner: null,
};

export const NiumaContext = createContext<NiumaContextType>(defaultContext);
