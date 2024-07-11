import { WxxRoute } from "@/types/router";
import { VscHome } from 'react-icons/vsc'

const homeRoutes: WxxRoute[] = [
  {
    path: '/home',
    component: () => <div>root page</div>,
    meta: {
      icon: () => <VscHome size='24px'/>
    }
  }
]

export default homeRoutes
