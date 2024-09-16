import AppContent from './AppContent.tsx';
import { Flex, Spacer } from '@chakra-ui/react';
import Style from './WxxLayout.module.sass';
import { memo } from 'react';

import { WxxHeader, WxxFooter, WxxToolBar, WxxMenu } from '@/components/wxx';
import { useAppSelector } from '@/store';
import { selectGlobal } from '@/store/modules/global';

function WxxLayout() {
  const globalState = useAppSelector(selectGlobal);

  if (globalState.isFullPage) {
    return <AppContent />
  }

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
