import { Flex, IconButton, Spacer } from '@chakra-ui/react';
import Style from './wxx.module.sass';
import type { WxxRoute } from '@/types/router';
import { useLocation, useNavigate } from 'react-router-dom';
import { memo, use } from 'react';
import { AppContext } from '@/app/context/app-context'

const renderMenuItems = (routes: WxxRoute[], theme: string) => {
  const navigate = useNavigate();
  const location = useLocation();

  return Array.from(routes)
    .filter(
      (route) =>
        route.meta !== undefined &&
        !route.meta.hidden &&
        route.meta.icon !== undefined &&
        (route.component !== undefined ||
          (route.children !== undefined && route.children.length > 0)),
    )
    .sort((a, b) => {
      const indexA = a.meta?.index ?? 0;
      const indexB = b.meta?.index ?? 0;
      return indexB - indexA;
    })
    .map((route) => {
      const path = route.path;
      const Icon = route.meta!.icon!;

      const active = path === location.pathname;

      return (
        <IconButton
          mt="1"
          key={path}
          colorPalette={theme}
          variant={active ? 'solid' : 'ghost'}
          aria-label={path}
          onClick={() => { navigate(path) }}
        >
          <Icon />
        </IconButton>
      );
    });
};

function WxxSideMenu(props: { routes: WxxRoute[] }) {
  const allRoutes = props.routes;
  const internal: WxxRoute[] = [];
  const outer: WxxRoute[] = [];

  for (const route of allRoutes) {
    (route.isOuter === true ? outer : internal).push(route);
  }

  const { theme } = use(AppContext);
  const bg = [theme, 400].join('.');

  return (
    <Flex flexDirection="column" bg={bg} className={Style.menu}>
      {renderMenuItems(outer, theme)}
      <Spacer />
      {renderMenuItems(internal, theme)}
    </Flex>
  );
}

export const WxxMenu = memo(WxxSideMenu);
