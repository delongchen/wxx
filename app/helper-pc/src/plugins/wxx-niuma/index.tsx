import { WxxPluginRaw } from '@/app/plugin/types';
import { fetchLatestChampionSummaries } from './apis/lol';
import { WxxNiumaContext } from './context';
import { newNiumaWorker } from './workers';
import { useCurrentSummoner } from 'tauri-plugin-wxx-core/hooks';
import { use } from 'react';


export const WxxNiuma: WxxPluginRaw = {
  name: 'wxx-niuma',
  cover: 'https://github.com/WxsbProject.png',
  version: '0.0.1',
  description: ['旧牛马网移植'],
  async install({ page, AppContext, quit }) {
    const championSummaries = await fetchLatestChampionSummaries('zh_CN');
    const niumaWorker = newNiumaWorker();

    page({
      name: 'niuma-main-page',
      icon: () => '牛马',
      fullPage: true,
      component: () => {
        const { theme } = use(AppContext);
        const currentSummoner = useCurrentSummoner();

        return (
          <WxxNiumaContext value={{
            theme,
            championSummaries,
            currentSummoner,
            niumaWorker,
          }}>
            <div>niuma</div>
          </WxxNiumaContext>
        );
      },
    });

    quit(async () => {
      await niumaWorker.cleanup();
    });
  },
};
