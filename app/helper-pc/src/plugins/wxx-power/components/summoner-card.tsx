import { memo } from "react";
import {
  Card,
  Flex,
  Avatar,
  Box,
  Text,
  Heading, CardHeader, Tag,
} from '@chakra-ui/react'
import { SummonerInfo } from "tauri-plugin-wxx-core";

interface SummonerCardProps {
  info: SummonerInfo
}

function SummonerCard(props: SummonerCardProps) {
  const { info } = props

  return (
    <Card>
      <CardHeader>
        <Flex flex='1' gap='4' alignItems='center'>
          <Avatar name='隆桑'/>
          <Box>
            <Heading size='sm'>
              {info.gameName}
              <Tag>
                #{info.tagLine}
              </Tag>
            </Heading>
            <Text>
              roll: 2
            </Text>
          </Box>
        </Flex>
      </CardHeader>
    </Card>
  )
}

export default memo(SummonerCard)