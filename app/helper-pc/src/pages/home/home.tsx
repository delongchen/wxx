import { memo } from 'react';
import { Box } from '@chakra-ui/react';

import { invoke } from '@tauri-apps/api/core'
import { BytesList } from 'wxx-protobufs/common'
import { matchHistory } from 'wxx-protobufs/lcu'

const test = async () => {
  const id = '09e8acd6-c839-5416-b39f-645f595c0b22'
  invoke<ArrayBuffer>('plugin:wxx-core|query_game', { puuid: id })
    .then(result => {
      const start = performance.now()
      const { data } = BytesList.decode(new Uint8Array(result));

      let count = 0;
      for (const item of data) {
        const game = matchHistory.Game.decode(item)
        count = count + 1
      }
      const end = performance.now()

      console.log(end - start, count)
    })
}

function HomePage() {
  return (
    <Box>
      <button onClick={test}>test</button>
    </Box>
  );
}

export default memo(HomePage);
