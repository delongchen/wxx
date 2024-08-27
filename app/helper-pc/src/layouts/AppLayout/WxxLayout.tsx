import AppContent from './AppContent.tsx';
import { Flex, Spacer } from '@chakra-ui/react';
import Style from './WxxLayout.module.sass';
import { memo } from 'react';

import { WxxHeader, WxxFooter, WxxToolBar, WxxMenu } from '@/components/wxx';

function WxxLayout() {
  return (
    <Flex flexDirection={'column'} className={Style.panel}>
      <WxxHeader />
      <Spacer className={Style.center}>
        <WxxMenu />
        <Spacer>
          <AppContent />
        </Spacer>
        <WxxToolBar />
      </Spacer>
      <WxxFooter />
    </Flex>
  );
}

export default memo(WxxLayout);
