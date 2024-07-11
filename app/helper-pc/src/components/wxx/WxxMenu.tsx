import { Flex, IconButton } from "@chakra-ui/react";
import Style from './wxx.module.sass'
import type { WxxRoute } from "@/types/router";
import { ReactElement } from "react";
import { allRoutes } from "@/router";
import { useLocation, useNavigate } from "react-router-dom";

const renderMenuItems = (routes: WxxRoute[]) => {
  const navigate = useNavigate()
  const location = useLocation()

  const result: ReactElement[] = []

  for (const route of routes) {
    const { meta, path, component } = route

    if (
      component === undefined ||
      meta === undefined ||
      meta.hidden === true
    ) {
      continue
    }

    const { icon: Icon } = meta
    if (Icon !== undefined) {
      result.push(
        <IconButton
          key={path}
          icon={<Icon />}
          variant={location.pathname === path ? 'solid' : 'none'}
          aria-label={path}
          onClick={() => navigate(path)}
        />
      )
    }
  }

  return result
}

export function WxxMenu() {
  return (
    <Flex
      flexDirection='column'
      bg='gray.500'
      className={Style.menu}
    >{renderMenuItems(allRoutes)}</Flex>
  )
}
