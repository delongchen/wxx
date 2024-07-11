import { memo, ReactElement, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { WxxRoute } from "@/types/router";
import { Box } from "@chakra-ui/react";
import { allRoutes } from "@/router";
import { resolve } from "@/utils/path";
import AppPage from "@/layouts/AppLayout/AppPage.tsx";


const renderRoutes = (
  routes: WxxRoute[],
  parentPath: string = '',
) => {
  const result: ReactElement[] = []

  for (let index = 0; index < routes.length; index++) {
    const route = routes[index]
    const {
      children,
      redirect,
      component: Component,
    } = route
    const currentPath = resolve(parentPath, route.path)

    if (redirect !== undefined) {
      result.push(
        <Route
          key={index}
          path={currentPath}
          element={
            <Navigate to={redirect} replace />
          }
        />
      )
      continue
    }

    if (Component !== undefined) {
      result.push(
        <Route
          key={index}
          path={currentPath}
          element={
            <AppPage>
              <Component/>
            </AppPage>
          }
        />
      )
      continue
    }

    if (children !== undefined) {
      result.push(...renderRoutes(children, currentPath))
    }
  }

  return result
}

function AppContent() {
  return (
    <Box>
      <Suspense
        fallback={
          <Box>loading</Box>
        }
      >
        <Routes>{renderRoutes(allRoutes)}</Routes>
      </Suspense>
    </Box>
  )
}

export default memo(AppContent)
