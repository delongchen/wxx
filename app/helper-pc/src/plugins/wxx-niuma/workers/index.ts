import { analyzeMatches } from './analyze'

const handlers: Record<string, (payload: unknown) => Promise<unknown> | unknown> = {}

const timeout = (ms: number) => new Promise((_, reject) => {
  setTimeout(() => {
    reject(new Error('Timeout'))
  }, ms)
})

const postResult = (id: number, ok: boolean, data: unknown) => {
  self.postMessage({ id, ok, data })
}

const handleIncomingMessage = async (
  message: MessageEvent<{
    id: number,
    cmd: string,
    payload: unknown
  }>
) => {
  const {
    data: { id, cmd, payload }
  } = message

  const resolve = (data: unknown) => {
    postResult(id, true, data)
  }

  const reject = (err: unknown) => {
    postResult(id, false, err)
  }

  const handler = handlers[cmd]
  if (handler === undefined) {
    reject(new Error(`Unknown command ${cmd}`))
    return
  }

  try {
    const result = await Promise.race([
      handler(payload),
      timeout(5000),
    ])
    resolve(result)
  } catch (error) {
    reject(error)
  }
}

self.onmessage = handleIncomingMessage

handlers['analyze'] = analyzeMatches
