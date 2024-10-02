import { memo, ReactElement, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { WxxRoute } from '@/types/router';
import { Box } from '@chakra-ui/react';
import AppPage from '@/layouts/AppLayout/AppPage.tsx';

type RoutesElements = ReactElement[];

const renderRoutes = (routes: WxxRoute[], isRoot: boolean) => {
  const result: RoutesElements = [];

  routes.forEach((route, index) => {
    const {
      path,
      redirect,
      isIndexPage,
      children = [],
      component: Component,
      isFullPage = false,
    } = route;

    if (redirect !== undefined) {
      result.push(<Route key={index} path={path} element={<Navigate to={redirect} replace />} />);
      return;
    }

    if (Component === undefined && children.length === 0) {
      return;
    }

    if (Component === undefined) {
      result.push(
        <Route
          key={index}
          path={path}
          element={
            isRoot ? (
              <AppPage isFullPage={isFullPage}>
                <Outlet />
              </AppPage>
            ) : (
              <Outlet />
            )
          }
        >
          {renderRoutes(children, false)}
        </Route>
      );
      return;
    }

    if (children.length === 0) {
      result.push(
        <Route
          key={index}
          path={path}
          index={isIndexPage}
          element={
            isRoot ? (
              <AppPage isFullPage={isFullPage}>
                <Component />
              </AppPage>
            ) : (
              <Component />
            )
          }
        />
      );
      return;
    }

    result.push(
      <Route
        key={index}
        path={path}
        element={
          isRoot ? (
            <AppPage isFullPage={isFullPage}>
              <Component>
                <Outlet />
              </Component>
            </AppPage>
          ) : (
            <Component>
              <Outlet />
            </Component>
          )
        }
      >
        {renderRoutes(children, false)}
      </Route>
    );
  });

  return result;
};

function AppContent(props: { routes: WxxRoute[] }) {
  return (
    <Box>
      <Suspense fallback={<Box>loading</Box>}>
        <Routes>{renderRoutes(props.routes, true)}</Routes>
      </Suspense>
    </Box>
  );
}

export default memo(AppContent);
