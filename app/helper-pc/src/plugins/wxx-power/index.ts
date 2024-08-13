import { WxxPluginType } from '@/types/plugin'

import icon from './icon.tsx'
import App from './page.tsx'
import LcuStatusTag from "./components/lcu-status-tag.tsx";
import store from "@/store";
import { syncToLocalConfig } from "@/store/modules/wxx-power";
import { lcuEventBus } from "./lcu/app-listener";
import './lcu/auto-game-flow'

const wxxPower: WxxPluginType = {
  name: 'wxx-power',
  async install(ctx) {
    ctx.registerPage({
      path: '/',
      component: App,
      meta: {
        icon
      }
    })

    ctx.registerStatusBarItem(LcuStatusTag)

    store.dispatch(syncToLocalConfig(state => {
      console.log(state)
      lcuEventBus.start()
    }))
  }
}

export default wxxPower
