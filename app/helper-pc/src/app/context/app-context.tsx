import { PropsWithChildren, createContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLocalConfig, selectGlobal } from '@/store/modules/global';

export interface AppContextType {
  theme: string;
}

export const AppContext = createContext<AppContextType>({
  theme: 'gray',
});

export function AppProvider({ children }: PropsWithChildren) {
  const { theme } = useAppSelector(selectGlobal);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchLocalConfig());
  }, []);

  return (
    <AppContext value={{ theme }}>{children}</AppContext>
  );
}
