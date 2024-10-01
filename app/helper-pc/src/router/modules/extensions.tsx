import { WxxRoute } from '@/types/router';
import { VscExtensions } from 'react-icons/vsc';
import ExtensionsPage from '@/pages/extensions';

const extensionRoutes: WxxRoute[] = [
  {
    path: '/extensions',
    component: ExtensionsPage,
    meta: {
      icon: () => <VscExtensions size="24px" />,
      index: 2,
    },
  },
];

export default extensionRoutes;
