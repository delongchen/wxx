import { WxxPluginType } from '@/types/plugin';
import icon from './icon.tsx';
import App from './page.tsx';
import LcuStatusTag from './components/lcu-status-tag.tsx';
import store from '@/store';
import { syncToLocalConfig } from '@/store/modules/wxx-power';
import GroupPage from './pages/group-page';
import { VscCloud } from 'react-icons/vsc';
import { startServices } from './services';


const wxxPower: WxxPluginType = {
  name: 'wxx-power',
  async install(ctx) {
    ctx.registerPage({
      path: '/',
      component: App,
      meta: {
        icon,
      },
    });

    ctx.registerPage({
      path: '/groups',
      component: GroupPage,
      meta: {
        icon: () => <VscCloud size="24px" />,
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
