import { Box, Button } from "@chakra-ui/react";
import { invoke } from '@tauri-apps/api/core'

const testLcuFetch = async () => {
  const res = await invoke("plugin:wxx-core|lcu_fetch", {
    method: 'get',
    endpoint: '/lol-summoner/v1/current-summoner',
  }).catch(err => err)

  console.log(res)
}

export function ExtensionsPage() {
  return (
    <Box>
      <Button onClick={testLcuFetch}>some</Button>
    </Box>
  )
}
