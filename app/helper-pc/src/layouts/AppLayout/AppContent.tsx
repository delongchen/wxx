import { memo } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { WxxRoute } from '@/types/router';
import AppPage from '@/layouts/AppLayout/AppPage.tsx';

const renderChildrenRoutes = (routes: WxxRoute[]) => {
  let hasIndex = false;

  return routes.map((route, routeIndex) => {
    const { redirect, children = [], component: Component } = route;

    let index: boolean = false;
    if (!hasIndex && route.isIndexPage === true) {
      index = true;
      hasIndex = true;
    }

    const path = index ? undefined : route.path;

    /**
     * handle redirect first.
     * render it as a Navigation
     */
    if (redirect !== undefined) {
      return <Route key={routeIndex} path={path} element={<Navigate to={redirect} replace />} />;
    }

    /**
     * we do not render a route who has no component and no children
     */
    if (Component === undefined && children.length === 0) {
      return null;
    }

    /**
     * enter here it is means that a route has children but no component
     */
    if (Component === undefined) {
      return (
        <Route key={routeIndex} path={path} element={<Outlet />}>
          {renderChildrenRoutes(children)}
        </Route>
      );
    }

    /**
     * likely, enter here means that a route has a component but no children
     * we just render its component
     */
    if (children.length === 0) {
      return <Route key={routeIndex} path={path} index={index} element={<Component />} />;
    }

    /**
     * last, a route has both component and children
     */
    return (
      <Route key={routeIndex} path={path} element={<Component />}>
        {renderChildrenRoutes(children)}
      </Route>
    );
  });
};

const renderRootLevelRoutes = (routes: WxxRoute[]) =>
  routes.map((route, index) => {
    const { path, isFullPage = false, children = [], component: Component, redirect } = route;

    if (redirect !== undefined) {
      return <Route key={index} path={path} element={<Navigate to={redirect} replace />} />;
    }

    return (
      <Route
        key={index}
        path={path}
        element={
          <AppPage isFullPage={isFullPage}>
            {Component === undefined ? <Outlet /> : <Component />}
          </AppPage>
        }
      >
        {children.length !== 0 && renderChildrenRoutes(children)}
      </Route>
    );
  });

function AppContent(props: { routes: WxxRoute[] }) {
  return (
    <Routes>{renderRootLevelRoutes(props.routes)}</Routes>
  );
}

export default memo(AppContent);
