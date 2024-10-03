import { createContext } from 'react';
import { NiumaContextType } from './types';

const defaultContext: NiumaContextType = {
  theme: 'gray',
};

export const NiumaContext = createContext<NiumaContextType>(defaultContext);
