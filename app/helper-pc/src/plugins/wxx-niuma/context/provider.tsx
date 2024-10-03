import { PropsWithChildren } from 'react';
import { useAppTheme } from '@/app/context/app-context.tsx';
import { NiumaContext } from './ctx';

export function NiumaContextProvider({ children }: PropsWithChildren) {
  const theme = useAppTheme();

  return (
    <NiumaContext.Provider
      value={{
        theme,
      }}
    >
      {children}
    </NiumaContext.Provider>
  );
}
