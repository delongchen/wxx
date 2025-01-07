import { WxxPluginRaw } from '@/app/plugin/types';
import { use } from 'react';

const WxxLifeGame: WxxPluginRaw = {
  name: 'wxx-life-game',
  cover: 'https://github.com/WxsbProject.png',
  version: '0.0.1',
  description: ['Life Game'],
  async install({ page, AppContext }) {
    page({
      name: 'life-game-index',
      icon: () => 'life',
      fullPage: true,
      component: () => {
        const { theme } = use(AppContext);

        return (
          <div>{theme}</div>
        );
      },
    });
  },
};

export default WxxLifeGame;
