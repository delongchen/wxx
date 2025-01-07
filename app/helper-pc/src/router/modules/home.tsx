import { WxxRoute } from '@/types/router';
import { VscHome } from 'react-icons/vsc';
import HomePage from '@/pages/home/home';

const homeRoutes: WxxRoute[] = [
  {
    path: '/home',
    component: HomePage,
    meta: {
      icon: () => <VscHome size="24px" />,
      index: 3,
    },
  },
];

export default homeRoutes;
