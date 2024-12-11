import { WxxPluginRaw } from '@/app/plugin/types';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react'

const Back = () => {
  const nav = useNavigate();

  const back = useCallback(() => {
    nav('/home', { replace: true })
  }, [nav])

  return (
    <button onClick={back}>back</button>
  )
}

const wxxGenshin: WxxPluginRaw = {
  name: 'wxx-genshin',
  cover: 'https://github.com/WxsbProject.png',
  version: '0.0.2',
  async install({ page }) {
    page({
      name: 'genshin',
      fullPage: true,
      icon: () => '原翔',
      component: () => (
        <div>
          <Back />
        </div>
      )
    })
  }
}

export default wxxGenshin
