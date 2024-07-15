import {Flex, IconButton, Spacer} from "@chakra-ui/react"
import Style from './wxx.module.sass'
import type {WxxRoute} from "@/types/router"
import {staticRoutes} from "@/router"
import {useLocation, useNavigate} from "react-router-dom"

const renderMenuItems = (routes: WxxRoute[]) => {
  const navigate = useNavigate()
  const location = useLocation()

  return Array
    .from(routes)
    .filter(route => (
      route.component !== undefined &&
      route.meta !== undefined &&
      !route.meta.hidden &&
      route.meta.icon !== undefined
    ))
    .sort((a, b) => {
      const indexA = a.meta?.index ?? 0
      const indexB = b.meta?.index ?? 0
      return indexB - indexA
    })
    .map(route => {
      const path = route.path
      const Icon = route.meta!.icon!
      return (
        <IconButton
          key={path}
          icon={<Icon/>}
          variant={location.pathname === path ? 'solid' : 'none'}
          aria-label={path}
          onClick={() => navigate(path)}
        />
      )
    })
}

export function WxxMenu() {
  return (
    <Flex
      flexDirection='column'
      bg='gray.500'
      className={Style.menu}
    >
      <Spacer/>
      {renderMenuItems(staticRoutes)}
    </Flex>
  )
}
