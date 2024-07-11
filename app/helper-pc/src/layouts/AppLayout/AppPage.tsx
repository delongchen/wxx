import { Box } from "@chakra-ui/react";
import { memo, PropsWithChildren } from "react";
import Style from './AppPage.module.sass'

type AppPageProps = PropsWithChildren<{
  isFullPage?: boolean
}>

function AppPage(props: AppPageProps) {
  const { children, isFullPage } = props

  if (isFullPage === true) {
    return <>{children}</>
  }

  return (
    <Box className={Style.panel}>{children}</Box>
  )
}

export default memo(AppPage)
