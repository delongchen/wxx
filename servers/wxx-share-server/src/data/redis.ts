import { RedisConfig } from '../config'
import { createClient } from 'redis'


const { user, password, host, port, database } = RedisConfig
const url = `redis://${user}:${password}@${host}:${port}/${database}`

const client = createClient({ url, database })

export const connect = () => client.connect()
  .then(() => {
    console.log('connected to redis')
  })
  .catch(console.error)

client.on('disconnect', console.log)

export const toHSETObject = (raw: Record<string, any>) => {
  const result: Record<string, string | number> = {}

  Object.entries(raw).forEach(([key, value]) => {
    switch (typeof value) {
      case 'string':
        result[key] = value
        break
      case 'number':
        result[key] = value
        break
      case 'boolean':
        result[key] = value ? 1 : 0
    }
  })

  return result
}

export {
  client as redisClient,
}
