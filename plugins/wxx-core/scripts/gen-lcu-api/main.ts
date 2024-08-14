import { readFile } from 'node:fs/promises'
import * as path from 'node:path'
import { parse } from 'yaml'
import { createApi } from './core'


interface LcuApiModule {
  [p: string]: LcuApiModule | string | string[]
}

interface GenConfig {
  outputDir: string
  typesDir: string
}

const baseDir = 'C:\\Users\\cdlfg\\RustroverProjects\\lol_helper\\plugins\\wxx-core\\guest-js'

const config: GenConfig = {
  outputDir: path.join(baseDir, 'api', 'lcu-api'),
  typesDir: '../..'
}

const main = async () => {
  await readFile('../lcu-api.yml', 'utf-8')
    .then(parse)
    .then(value => gen(value, config))
}

const genOneModule = async (
  namespace: string,
  mod: LcuApiModule,
  config: GenConfig,
) => {
  const helper = (
    prefix: string,
    data: LcuApiModule | string | string[]
  ) => {
    if (typeof data === 'string' || Array.isArray(data)) {
      createApi(prefix, data)
      return
    }

    for (const [key, value] of Object.entries(data)) {
      helper([prefix, key].join('/'), value)
    }
  }

  helper('', mod)
}

const gen = async (raw: LcuApiModule, config: GenConfig) => {
  const tasks = Object
    .entries(raw)
    .map(([namespace, mod]) => genOneModule(
      namespace,
      mod as LcuApiModule,
      config,
    ))

  let root = Promise.resolve()
  for (const task of tasks) {
    root = root.then(() => task)
  }
  return root
}

main().catch(console.error)
