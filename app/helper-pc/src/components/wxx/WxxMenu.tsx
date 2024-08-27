import { Flex, IconButton, Spacer } from '@chakra-ui/react';
import Style from './wxx.module.sass';
import type { WxxRoute } from '@/types/router';
import { getAllRoutes } from '@/router';
import { useLocation, useNavigate } from 'react-router-dom';
import { memo } from 'react';
import { useAppSelector } from '@/store';
import { selectGlobal } from '@/store/modules/global';

const renderMenuItems = (routes: WxxRoute[], theme: string) => {
  const navigate = useNavigate();
  const location = useLocation();

  return Array.from(routes)
    .filter(
      route =>
        route.component !== undefined &&
        route.meta !== undefined &&
        !route.meta.hidden &&
        route.meta.icon !== undefined,
    )
    .sort((a, b) => {
      const indexA = a.meta?.index ?? 0;
      const indexB = b.meta?.index ?? 0;
      return indexB - indexA;
    })
    .map(route => {
      const path = route.path;
      const Icon = route.meta!.icon!;
      return (
        <IconButton
          key={path}
          colorScheme={theme}
          icon={<Icon />}
          variant={location.pathname === path ? 'solid' : 'none'}
          aria-label={path}
          onClick={() => navigate(path)}
        />
      );
    });
};

function WxxSideMenu() {
  const allRoutes = getAllRoutes();
  const internal: WxxRoute[] = [];
  const outer: WxxRoute[] = [];

  for (const route of allRoutes) {
    (route.isOuter === true ? outer : internal).push(route);
  }

  const globalState = useAppSelector(selectGlobal);
  const theme = globalState.theme;
  const bg = [theme, 600].join('.');

  return (
    <Flex flexDirection="column" bg={bg} className={Style.menu}>
      {renderMenuItems(outer, theme)}
      <Spacer />
      {renderMenuItems(internal, theme)}
    </Flex>
  );
}

export const WxxMenu = memo(WxxSideMenu);
