import { WxxPluginRaw } from '@/app/plugin/types';
import { mainPage } from './routes';

const wxxNiuma: WxxPluginRaw = {
  name: 'wxx-niuma',
  cover: 'https://github.com/WxsbProject.png',
  version: '0.0.1',
  description: ['旧牛马网移植'],
  async install(ctx) {
    const { page } = ctx;

    page(mainPage);
  },
};

export default wxxNiuma;
