import {memo, useEffect} from "react";
import {
  Box,
  Heading, Stack,
  Text,
} from '@chakra-ui/react'
import Style from './page.module.sass'
import {useAppDispatch} from "@/store";
import {syncToLocalConfig} from "@/store/modules/wxx-power";
import TikTokHelper from "./components/tik-tok-helper.tsx";


function Page() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(syncToLocalConfig())
  }, [])

  return (
    <>
      <Box className={Style.container}>
        <Box className={Style.heading}>
          <Heading>吴翔翔的神奇工具箱</Heading>
          <Text>WXX`s Magical Toolbox</Text>
        </Box>

        <Stack spacing='24px'>
          <TikTokHelper/>
        </Stack>
      </Box>
    </>
  )
}

export default memo(Page)
