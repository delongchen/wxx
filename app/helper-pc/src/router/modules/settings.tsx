import { WxxRoute } from "@/types/router";
import { VscSettings } from 'react-icons/vsc'

const settingRoutes: WxxRoute[] = [
  {
    path: '/settings',
    component: () => <div>settings</div>,
    meta: {
      icon: () => <VscSettings size='24px'/>
    }
  }
]

export default settingRoutes
