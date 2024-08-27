import { WxxRoute } from '@/types/router';
import { VscSettings } from 'react-icons/vsc';
import SettingsPage from '@/pages/settings';

const settingRoutes: WxxRoute[] = [
  {
    path: '/settings',
    component: SettingsPage,
    meta: {
      icon: () => <VscSettings size="24px" />,
      index: 1,
    },
  },
];

export default settingRoutes;
