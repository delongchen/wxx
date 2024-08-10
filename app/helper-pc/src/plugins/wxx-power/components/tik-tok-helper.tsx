import {useAppDispatch, useAppSelector} from "@/store";
import {selectGlobal} from "@/store/modules/global";
import {selectWxxPower, setStateAsync} from "@/store/modules/wxx-power";
import {memo, useCallback, useEffect, ChangeEvent} from "react";
import {
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  SimpleGrid,
  Switch,
  Tooltip
} from "@chakra-ui/react";
import { autoAcceptHandler, autoNextHandler } from "../lcu/tik-tok-helper.ts";

function TikTokHelper() {
  const { theme } = useAppSelector(selectGlobal)
  const dispatch = useAppDispatch()

  const {
    autoAcceptMatch,
    autoNextMatch,
  } = useAppSelector(selectWxxPower)

  useEffect(() => {
    autoAcceptHandler.active = autoAcceptMatch
  }, [autoAcceptMatch])

  useEffect(() => {
    autoNextHandler.active = autoNextMatch
  }, [autoNextMatch])

  const handleClick = useCallback((
    ev: ChangeEvent<HTMLInputElement>
  ) => {
    const id = ev.target.id
    if (id === 'wxx-power-auto-accept-match') {
      dispatch(setStateAsync(prev => ({
        autoAcceptMatch: !prev.autoAcceptMatch
      })))
    } else if (id === 'wxx-power-auto-next-match') {
      dispatch(setStateAsync(prev => ({
        autoNextMatch: !prev.autoNextMatch
      })))
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <Tooltip
          label='游戏中途还能刷抖音 我测 简直太酷了! 赞美吴翔!'
          placement='top-start'
        >
          <Heading size='md'>刷抖音助手</Heading>
        </Tooltip>
      </CardHeader>
      <CardBody>
        <FormControl as={SimpleGrid} columns={{ base: 2, md: 4 }}>
          <FormLabel
            htmlFor='wxx-power-auto-accept-match'
          >自动接受对局</FormLabel>
          <Switch
            id='wxx-power-auto-accept-match'
            isChecked={autoAcceptMatch}
            colorScheme={theme}
            onChange={handleClick}
          />

          <FormLabel
            htmlFor='wxx-power-auto-next-match'
          >自动再来一把</FormLabel>
          <Switch
            id='wxx-power-auto-next-match'
            isChecked={autoNextMatch}
            colorScheme={theme}
            onChange={handleClick}
          />
        </FormControl>
      </CardBody>
    </Card>
  )
}

export default memo(TikTokHelper);
