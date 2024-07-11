import AppContent from "./AppContent.tsx";
import { Flex, Spacer } from "@chakra-ui/react";
import Style from './WxxLayout.module.sass'

import {
  WxxHeader,
  WxxFooter,
  WxxToolBar,
  WxxMenu,
} from '@/components/wxx'

export function WxxLayout() {
  return (
    <Flex flexDirection={'column'} className={Style.panel}>
      <WxxHeader />
      <Spacer className={Style.center}>
        <WxxMenu />
        <Spacer><AppContent /></Spacer>
        <WxxToolBar />
      </Spacer>
      <WxxFooter />
    </Flex>
  )
}
