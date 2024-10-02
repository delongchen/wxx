import { WxxPluginRaw } from '@/app/plugin/types';

import NiumaPage from './pages/NiumaPage.tsx'

const wxxNiuma: WxxPluginRaw = {
  name: 'wxx-niuma',
  cover: 'https://github.com/WxsbProject.png',
  version: '0.0.1',
  description: [
    '旧牛马网移植',
  ],
  async install(ctx) {
    const { page } = ctx

    page('niuma-page', NiumaPage, () => 'nm')
  }
}

export default wxxNiuma
