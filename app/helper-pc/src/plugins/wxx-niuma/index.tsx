import { WxxPluginRaw } from '@/app/plugin/types';
import { fetchLatestChampionSummaries } from './apis/lol';
import { WxxNiumaContext, WxxNiumaContextType } from './context';
import { newNiumaWorker } from './workers';
import { useCurrentSummoner } from 'tauri-plugin-wxx-core/hooks';
import { use } from 'react';


const name = 'wxx-niuma';
const cover = 'https://github.com/WxsbProject.png'
const version = '0.0.1'
const description = ['旧牛马网移植']

export const WxxNiuma: WxxPluginRaw = {
  name,
  cover,
  version,
  description,
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

        const ctx: WxxNiumaContextType = {
          theme,
          championSummaries,
          currentSummoner,
          niumaWorker,
        }

        return (
          <WxxNiumaContext value={ctx}>
            <div>niuma</div>
          </WxxNiumaContext>
        );
      },
      children: []
    });

    quit(async () => {
      await niumaWorker.cleanup();
    });
  },
};
