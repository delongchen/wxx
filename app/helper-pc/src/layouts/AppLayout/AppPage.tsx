import { Box } from '@chakra-ui/react';
import { memo, PropsWithChildren, useEffect } from 'react';
import Style from './AppPage.module.sass';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectGlobal, switchFullPage } from '@/store/modules/global';

type AppPageProps = PropsWithChildren<{
  isFullPage?: boolean;
}>;

function AppPage(props: AppPageProps) {
  const { children, isFullPage } = props;

  const dispatch = useAppDispatch();
  const globalState = useAppSelector(selectGlobal);

  const bg = [globalState.theme, 100].join('.');

  useEffect(() => {
    dispatch(switchFullPage(isFullPage));
  }, [isFullPage]);

  if (isFullPage === true) {
    return <>{children}</>;
  }

  return (
    <Box className={Style.container}>
      <Box className={Style.panel} bg={bg}>
        {children}
      </Box>
    </Box>
  );
}

export default memo(AppPage);
