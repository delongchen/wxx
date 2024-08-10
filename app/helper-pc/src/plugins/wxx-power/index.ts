import { WxxPluginType } from '@/types/plugin'

import './lcu'
import icon from './icon.tsx'
import page from './page.tsx'
import LcuStatusTag from "./components/lcu-status-tag.tsx";

const wxxPower: WxxPluginType = {
  name: 'wxx-power',
  async install(ctx) {
    ctx.registerPage({
      path: '/',
      component: page,
      meta: {
        icon
      }
    })

    ctx.registerStatusBarItem(LcuStatusTag)
  }
}

export default wxxPower
