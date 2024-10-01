import AppContent from './AppContent.tsx';
import { Flex, Spacer } from '@chakra-ui/react';
import Style from './WxxLayout.module.sass';
import { memo } from 'react';

import { WxxHeader, WxxFooter, WxxToolBar, WxxMenu } from '@/components/wxx';
import { useAppSelector } from '@/store';
import { selectGlobal } from '@/store/modules/global';
import { useWxxRoutes } from '@/router';

function WxxLayout() {
  const routes = useWxxRoutes()

  const globalState = useAppSelector(selectGlobal);

  if (globalState.isFullPage) {
    return <AppContent routes={routes}/>
  }

  return (
    <Flex flexDirection={'column'} className={Style.panel}>
      <WxxHeader />
      <Spacer className={Style.center}>
        <WxxMenu routes={routes}/>
        <Spacer>
          <AppContent routes={routes}/>
        </Spacer>
        <WxxToolBar />
      </Spacer>
      <WxxFooter />
    </Flex>
  );
}

export default memo(WxxLayout);
