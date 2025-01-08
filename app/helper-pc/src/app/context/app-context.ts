import { createContext } from 'react';

export interface AppContextType {
  theme: string;
}

export const AppContext = createContext<AppContextType>({
  theme: 'gray',
});
