import { WxxPluginRaw } from '@/app/plugin/types';
import LcuStatusTag from './components/lcu-status-tag.tsx';
import store from '@/store';
import { syncToLocalConfig } from '@/store/modules/wxx-power';
import { VscTools } from 'react-icons/vsc';
import { startServices } from './services';
import TikTokPage from './pages/tik-tok-page';

const wxxPower: WxxPluginRaw = {
  name: 'wxx-power',
  cover: 'https://github.com/WxsbProject.png',
  version: '0.0.2',
  description: [
    '来自wx的神秘力量',
    '提供帮助兄弟们一边刷抖音还不用担心错过接受对局',
    '还提供了左下角登录状态显示',
    '赞美wx',
  ],
  async install(ctx) {
    const { page, statusBar, quit } = ctx;

    page({
      name: 'tik-tok',
      component: TikTokPage,
      icon: () => <VscTools size="24px" />,
    });

    statusBar('lcu-status', LcuStatusTag);

    store.dispatch(
      syncToLocalConfig(() => {
        startServices();
      }),
    );

    quit(async () => {
      console.log('quit');
    });
  },
};

export default wxxPower;
