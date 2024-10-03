import type { WxxPluginPageInfo } from '@/app/plugin/types';
import { NiumaContextProvider } from './context/provider.tsx';
import NiumaMainLayout from './components/NiumaMainLayout.tsx';
import NiumaPage from './pages/NiumaPage.tsx';

export const mainPageChildren: WxxPluginPageInfo[] = [
  {
    name: 'page1',
    component: NiumaPage,
    isIndexPage: true,
    meta: {
      text: 'page1',
    },
  },
  {
    name: 'page2',
    component: () => <div>page2</div>,
    meta: {
      text: 'page2',
    },
  },
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
