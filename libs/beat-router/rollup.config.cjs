const typescript = require("@rollup/plugin-typescript")

module.exports = {
    input: "src/index.ts",
    output: [
        {
            dir: "dist",
            format: "esm",
            preserveModules: true,
        }
    ],
    plugins: [
        typescript({
            declaration: true,
            declarationDir: "dist",
        }),
    ]
}
