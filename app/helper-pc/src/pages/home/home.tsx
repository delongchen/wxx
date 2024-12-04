import { memo } from 'react';
import { Box } from '@chakra-ui/react';
import { Button } from '@/components/ui/button'
import { invoke, Channel } from '@tauri-apps/api/core'

const puuid = 'a95f3e0f-6ca3-52db-a602-9ec0a6117e31'

const test1 = () => {
  const chan = new Channel<unknown>()
  chan.onmessage = console.log
  return invoke('plugin:wxx-core|sync_games_by_puuid', { puuid, fullUpdate: true, chan })
}

const test2 = () => {
  return invoke('plugin:wxx-core|fetch_game_history', { puuid, start: 0, end: 199 })
}

function HomePage() {
  return (
    <Box>
      <Button onClick={test1}>test</Button>
      <Button onClick={test2}>fetch</Button>
    </Box>
  )
}

export default memo(HomePage);
