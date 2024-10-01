import { WxxPluginRaw } from '@/app/plugin/types';
import LcuStatusTag from './components/lcu-status-tag.tsx';
import store from '@/store';
import { syncToLocalConfig } from '@/store/modules/wxx-power';
import { VscTools } from 'react-icons/vsc';
import { startServices } from './services';
import TikTokPage from './pages/tik-tok-page';

const wxxPower: WxxPluginRaw = {
  name: 'wxx-power',
  async install(ctx) {
    const { page, statusBar, quit } = ctx

    page('tik-tok', TikTokPage, () => <VscTools size="24px" />);

    statusBar('lcu-status', LcuStatusTag);

    store.dispatch(
      syncToLocalConfig(() => {
        startServices();
      })
    );

    quit(async () => {
      console.log('quit');
    })
  },
};

export default wxxPower;
