const yaml = require('yaml')
const fs = require('node:fs')


const a = yaml.parse(fs.readFileSync('./lcu-api.yml', "utf-8"))



const show = (apis) => {
    for (const [modName, mod] of Object.entries(apis)) {
        console.log(modName + ': ')
    }
}

show(a)
