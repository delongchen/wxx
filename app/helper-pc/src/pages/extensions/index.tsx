import {Box, Button, Input} from "@chakra-ui/react";
import { lcuFetch } from "tauri-plugin-wxx-core";
import {useCallback, useState} from "react";

export function ExtensionsPage() {
  const [text, setText] = useState('')
  const [value, setValue] = useState('')
  const handleChange = (ev: any) => {
    setValue(ev.target.value)
  }

  const handleClick = useCallback(() => {
    lcuFetch({endpoint: value, method: 'get'})
      .then(res => {
        setText(JSON.stringify(res, null, 2))
      })
      .catch(() => {
        setText('error')
      })
  }, [value])

  return (
    <Box>
      <Input
        value={value}
        onChange={handleChange}
      />
      <Button onClick={handleClick}>click</Button>
      <pre>{text}</pre>
    </Box>
  )
}
