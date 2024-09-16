import { WxxPluginType } from '@/types/plugin';
import LcuStatusTag from './components/lcu-status-tag.tsx';
import store from '@/store';
import { syncToLocalConfig } from '@/store/modules/wxx-power';
import { VscCloud, VscTools, VscPerson } from 'react-icons/vsc';
import { startServices } from './services';
import TikTokPage from './pages/tik-tok-page';
import GroupPage from './pages/group-page';
import NiumaPage from './pages/niuma-page';

const wxxPower: WxxPluginType = {
  name: 'wxx-power',
  async install(ctx) {
    ctx.registerPage({
      path: '/tik-tok',
      component: TikTokPage,
      meta: {
        icon: () => <VscTools size="24px" />,
      },
    });

    ctx.registerPage({
      path: '/groups',
      component: GroupPage,
      meta: {
        icon: () => <VscCloud size="24px" />,
      },
    });

    ctx.registerPage({
      path: '/niuma',
      component: NiumaPage,
      isFullPage: true,
      meta: {
        icon: () => <VscPerson size="24px" />,
      },
    });

    ctx.registerStatusBarItem(LcuStatusTag);

    store.dispatch(
      syncToLocalConfig(() => {
        startServices();
      }),
    );
  },
};

export default wxxPower;
