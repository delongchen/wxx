import { readFileSync } from "node:fs";

interface AppConfig {
  httpPort: number;
  redisConfig: {
    user: string,
    password: string,
    host: string,
    port: number,
    database: number,
  },
  lolProfileIconDir: string
}

const isAppConfig = (config: any): config is AppConfig => {
  return (
    typeof config === 'object' && config !== null &&
      typeof config.httpPort === 'number' &&
      typeof config.redisConfig === 'object' && config.redisConfig !== null &&
      typeof config.redisConfig.user === 'string' &&
      typeof config.redisConfig.password === 'string' &&
      typeof config.redisConfig.host === 'string' &&
      typeof config.redisConfig.port === 'number' &&
      typeof config.redisConfig.database === 'number' &&
      typeof config.lolProfileIconDir === 'string'
  )
}

export const config: AppConfig = JSON.parse(readFileSync('../config.json', 'utf8'));

if (!isAppConfig(config)) {
  console.log('read config failed!')
  process.exit(1);
}
