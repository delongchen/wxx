const typescript = require('@rollup/plugin-typescript')
const pkg = require('./package.json')

module.exports = {
  input: [
    'guest-js/index.ts',
    'guest-js/events/index.ts',
    'guest-js/api/index.ts',
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
    'rxjs',
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]
}
