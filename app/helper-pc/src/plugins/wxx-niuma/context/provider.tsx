import { PropsWithChildren } from 'react';
import { useAppTheme } from '@/app/context/app-context.tsx';
import { NiumaContext } from './ctx';
import { useCurrentSummoner } from 'tauri-plugin-wxx-core/hooks';
import { useMatchesParserWorker, useLolLatestVersion, useLolChampions } from './hooks';

export function NiumaContextProvider({ children }: PropsWithChildren) {
  const theme = useAppTheme();
  const currentSummoner = useCurrentSummoner();
  const { invoke } = useMatchesParserWorker();
  const { latestVersion } = useLolLatestVersion();
  const champions = useLolChampions(latestVersion, 'zh_CN')

  return (
    <NiumaContext.Provider
      value={{
        theme,
        invoke,
        currentSummoner,
        latestVersion,
        champions,
      }}
    >
      {children}
    </NiumaContext.Provider>
  );
}
