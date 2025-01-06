import type { WxxPluginPageInfo } from '@/app/plugin/types';
import { NiumaProvider } from './context/provider.tsx';
import NiumaMainLayout from './components/NiumaMainLayout.tsx';
import NiumaPage from './pages/NiumaPage/index.tsx';
import HistoryFetchPage from './pages/HistoryFetchPage.tsx';

export const mainPageChildren: WxxPluginPageInfo[] = [
  {
    name: 'index',
    component: NiumaPage,
    isIndexPage: true,
    meta: {
      text: '牛马人才库',
    },
  },
  {
    name: 'history-fetch',
    component: HistoryFetchPage,
    meta: {
      text: '寻找牛马',
    },
  },
];

export const mainPage: WxxPluginPageInfo = {
  name: 'niuma-page',
  icon: () => '牛马',
  fullPage: true,
  component: () => {
    return (
      <NiumaProvider>
        <NiumaMainLayout />
      </NiumaProvider>
    )
  },
  children: mainPageChildren,
};
