import { PropsWithChildren } from 'react';
import { useAppTheme } from '@/app/context/app-context.tsx';
import { NiumaContext } from './ctx';
import { useCurrentSummoner } from 'tauri-plugin-wxx-core/hooks'

export function NiumaContextProvider({ children }: PropsWithChildren) {
  const theme = useAppTheme();
  const currentSummoner = useCurrentSummoner();

  return (
    <NiumaContext.Provider
      value={{
        theme,
        currentSummoner,
      }}
    >
      {children}
    </NiumaContext.Provider>
  );
}
