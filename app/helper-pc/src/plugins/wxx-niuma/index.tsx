import { WxxPluginRaw } from '@/app/plugin/types';

import NiumaPage from './pages/NiumaPage.tsx';
import { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@chakra-ui/react';

const wxxNiuma: WxxPluginRaw = {
  name: 'wxx-niuma',
  cover: 'https://github.com/WxsbProject.png',
  version: '0.0.1',
  description: ['旧牛马网移植'],
  async install(ctx) {
    const { page } = ctx;

    page({
      name: 'niuma-page',
      icon: () => '牛马',
      fullPage: true,
      component: (props: PropsWithChildren) => {
        const nav = useNavigate()
        return (
          <div>
            <p>niuma</p>
            <Button onClick={() => {
              nav('page1')
            }}>go</Button>
            {props.children}
          </div>
        )
      },
      children: [
        {
          name: 'page1',
          component: NiumaPage,
          isIndexPage: true,
        }
      ]
    })
  },
};

export default wxxNiuma;
