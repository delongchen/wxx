const pkg = require('./package.json')
const fs = require('node:fs')

const main = './servers/wxx-share-server/src/main.js'

pkg.main = main
pkg.type = undefined
pkg.scripts = {
  start: `node ${main}`
}
pkg.private = undefined

const pkg_dep = pkg.dependencies
pkg.dependencies = {
  ...pkg_dep,
  ['wxx-protobufs']: undefined,
}

fs.writeFileSync(
  './dist/package.json',
  JSON.stringify(pkg, null, 2),
  'utf8'
)
