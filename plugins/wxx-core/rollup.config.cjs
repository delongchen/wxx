const typescript = require('@rollup/plugin-typescript')
const pkg = require('./package.json')

const entries = [
  'events',
  'api',
  'streams',
  'hooks',
  'tools'
]

module.exports = {
  input: [
    'guest-js/index.ts',
    ...entries.map(entry => `guest-js/${entry}/index.ts`),
  ],
  output: [
    {
      dir: 'dist-js',
      format: 'esm',
      preserveModules: true,
    }
  ],
  plugins: [
    typescript({
      declaration: true,
      declarationDir: 'dist-js'
    })
  ],
  external: [
    /^@tauri-apps\/api/,
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    'rxjs',
    'react'
  ]
}
