import { memo } from 'react';
import { Box } from '@chakra-ui/react';
import { Button } from '@/components/ui/button'
import { invoke, Channel } from '@tauri-apps/api/core'

const puuid = '09e8acd6-c839-5416-b39f-645f595c0b22'

const test1 = () => {
  const chan = new Channel<unknown>()
  chan.onmessage = console.log
  return invoke('plugin:wxx-core|sync_games_by_puuid', { puuid, full: false, chan, test: true })
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
