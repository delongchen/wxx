import { Box } from "@chakra-ui/react";
import { WxxCore, LcuEventType } from 'tauri-plugin-wxx-core'
import { useState } from "react";

const useLcuState = () => {
  const [started, setStarted] = useState(false)

  WxxCore.listen(
    LcuEventType.LcuStateChange,
    ev => {
      console.log(ev)
      setStarted(ev.payload.data.is_started)
    }
  )

  return {
    started
  }
}

export function ExtensionsPage() {
  const { started } = useLcuState()

  return (
    <Box>
      state: {started ? 'start': 'not'}
    </Box>
  )
}
