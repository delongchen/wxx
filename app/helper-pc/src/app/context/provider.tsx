import { PropsWithChildren, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLocalConfig, selectGlobal } from '@/store/modules/global';
import { AppContext } from './app-context.ts';

function AppProvider({ children }: PropsWithChildren) {
  const { theme } = useAppSelector(selectGlobal);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchLocalConfig());
  }, []);

  return (
    <AppContext value={{ theme }}>{children}</AppContext>
  );
}

export default AppProvider;
