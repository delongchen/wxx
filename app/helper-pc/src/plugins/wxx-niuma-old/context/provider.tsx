import { PropsWithChildren } from 'react';
import { useAppTheme } from '@/app/context/app-context.tsx';
import { NiumaContext } from './niuma';
import { LolContext } from './lol';
import { getLatestChampions } from '../api/dragon';
import { useCurrentSummoner } from 'tauri-plugin-wxx-core/hooks';

type NiumaProviderProps = PropsWithChildren

export function NiumaProvider({ children }: NiumaProviderProps) {
  const theme = useAppTheme();
  const currentSummoner = useCurrentSummoner();
  const championsPromise = getLatestChampions('zh_CN');

  return (
    <NiumaContext
      value={{
        theme,
        currentSummoner,
      }}
    >
      <LolContext value={{ championsPromise }}>
        {children}
      </LolContext>
    </NiumaContext>
  );
}
