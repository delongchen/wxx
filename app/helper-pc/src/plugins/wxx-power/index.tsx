import { WxxPluginType } from '@/types/plugin'
import icon from './icon.tsx'
import App from './page.tsx'
import LcuStatusTag from "./components/lcu-status-tag.tsx";
import store from "@/store";
import { syncToLocalConfig } from "@/store/modules/wxx-power";
import { lcuEventBus } from "./lcu/app-listener";
import './lcu/auto-game-flow'
import GroupPage from "./pages/group-page";
import { VscCloud } from 'react-icons/vsc'
import { ws } from './ws'
import { uploadGameStatus } from './services/upload-game-status'


const wxxPower: WxxPluginType = {
  name: 'wxx-power',
  async install(ctx) {
    ws.connect()
    uploadGameStatus()

    ctx.registerPage({
      path: '/',
      component: App,
      meta: {
        icon
      }
    })

    ctx.registerPage({
      path: '/groups',
      component: GroupPage,
      meta: {
        icon: () => <VscCloud size='24px'/>,
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
