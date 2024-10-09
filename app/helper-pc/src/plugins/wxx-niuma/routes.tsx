import type { WxxPluginPageInfo } from '@/app/plugin/types';
import { NiumaContextProvider } from './context/provider.tsx';
import NiumaMainLayout from './components/NiumaMainLayout.tsx';
import NiumaPage from './pages/NiumaPage.tsx';
import HistoryFetchPage from './pages/HistoryFetchPage.tsx';
import GameTestPage from './pages/GameTestPage.tsx'

export const mainPageChildren: WxxPluginPageInfo[] = [
  {
    name: 'index',
    component: NiumaPage,
    isIndexPage: true,
    meta: {
      text: '我是牛马',
    },
  },
  {
    name: 'history-fetch',
    component: HistoryFetchPage,
    meta: {
      text: '成为牛马',
    },
  },
  {
    name: 'game-test',
    component: GameTestPage,
    meta: {
      text: '测试'
    }
  }
];

export const mainPage: WxxPluginPageInfo = {
  name: 'niuma-page',
  icon: () => '牛马',
  fullPage: true,
  component: () => (
    <NiumaContextProvider>
      <NiumaMainLayout />
    </NiumaContextProvider>
  ),
  children: mainPageChildren,
};
