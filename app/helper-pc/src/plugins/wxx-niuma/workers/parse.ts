import { Game } from 'tauri-plugin-wxx-core'

const WhiteSpace = new Set([
  '', ' ', '\n', '\t', '\r'
])

export const parseMatchesBuffer = (buf: ArrayBuffer): Game[] => {
  const decoder = new TextDecoder('utf-8')
  const text = decoder.decode(buf)
  return text
    .split('\n')
    .filter(line => !WhiteSpace.has(line))
    .map(line => JSON.parse(line))
}
