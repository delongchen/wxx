import { useNiumaContext } from '@/plugins/wxx-niuma/context/hooks.ts';
import { SyncTaskStatus, useSyncGameHistoryTask } from '@/plugins/wxx-niuma/core/niuma-task-manager.ts';
import { Button, Flex, HStack, Text } from '@chakra-ui/react';
import { ProgressBar, ProgressLabel, ProgressRoot, ProgressValueText } from '@/components/ui/progress.tsx';
import { memo } from 'react'
import type { SummonerInfo } from 'tauri-plugin-wxx-core';
import SummonerCard from '@/plugins/wxx-niuma/components/SummonerCard.tsx';

const GameSyncTask = memo(function GameSyncTask ({ puuid }: {puuid: string}) {
  const { theme } = useNiumaContext();
  const { status, start, data, tip } = useSyncGameHistoryTask(puuid)

  if (status === SyncTaskStatus.Ready) {
    return (
      <>
        <Button onClick={start} size='xs' colorPalette={theme}>同步至牛马数据库</Button>
        <Text textStyle='sm' color='gray'>{tip}</Text>
      </>
    )
  }

  if (status === SyncTaskStatus.Waiting) {
    return (
      <Text>稍等</Text>
    )
  }

  if (status === SyncTaskStatus.FetchingGameHistory) {
    if (data.length === 2) {
      const [start, end] = data
      return (
        <Text>正在扫描 {start} 至 {end} 页</Text>
      )
    }
  }

  if (status === SyncTaskStatus.FetchingGameDetails) {
    if (data.length === 2) {
      const [fetched, all] = data

      if (all === 0) {
        return (
          <Text>没有需要同步的对局</Text>
        )
      }

      const percentage = (100 * fetched) / all
      return (
        <ProgressRoot value={percentage}>
          <HStack gap='5'>
            <ProgressLabel>正在同步</ProgressLabel>
            <ProgressBar w='sm' colorPalette={theme}/>
            <ProgressValueText>{((percentage * 100) << 0) / 100}%</ProgressValueText>
          </HStack>
        </ProgressRoot>
      )
    }
  }

  return (<></>)
})

function GameSyncTaskCard({ summoner, main }: { summoner: SummonerInfo, main?: boolean }) {
  const { theme } = useNiumaContext();

  return (
    <SummonerCard summoner={summoner} main={main} bg={[theme, 200].join('.')}>
      <Flex w='100%' h='100%' direction='column' alignItems='center' justifyContent='center'>
        <GameSyncTask puuid={summoner.puuid} />
      </Flex>
    </SummonerCard>
  )
}

export default GameSyncTaskCard
