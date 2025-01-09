const { readFile, writeFile } = require('node:fs/promises')

const target_dirs = [
  '.',
  './app/helper-pc',
  './plugins/wxx-core',
  './servers/wxx-share-server',
  './libs/beat-router',
  './libs/protobufs',
  './docs'
]

const main = async () => {
  /** @type {Map<string, Set<string>>} */
  const deps_map = new Map

  for (const dir_name of target_dirs) {
    const pkg_file_path = [dir_name, 'package.json'].join('/')
    const pkg_file_content = await readFile(pkg_file_path, 'utf8')
    const { dependencies, devDependencies } = JSON.parse(pkg_file_content)
    const pkg_key = dir_name === '.' ? 'root' : dir_name

    if (dependencies !== undefined)
    for (const key of Object.keys(dependencies)) {
      const exist = deps_map.get(key)
      if (exist !== undefined) {
        exist.add(pkg_key)
      } else {
        deps_map.set(key, new Set([pkg_key]))
      }
    }

    if (devDependencies !== undefined)
    for (const key of Object.keys(devDependencies)) {
      const _name = [pkg_key, 'dev'].join('.')
      const exist = deps_map.get(key)
      if (exist !== undefined) {
        exist.add(_name)
      } else {
        deps_map.set(key, new Set([_name]))
      }
    }
  }

  const out = {}

  for (const [key, depSet] of deps_map.entries()) {
    if (depSet.size > 1) {
      out[key] = [...depSet]
    }
  }

  await writeFile('./check-packages.out.json', JSON.stringify(out, null, 2), 'utf8')
}

main().catch(console.error)
