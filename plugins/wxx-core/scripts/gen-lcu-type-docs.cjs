const fsp = require('node:fs/promises');

const SourceDir = '../guest-js/types/lcu-api'

fsp.readFile(SourceDir + '/champ-select.ts', 'utf8')
  .then(text => {
    console.log(text.split('\r\n\r\n'))
  })
