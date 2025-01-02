import { XMLParser } from 'fast-xml-parser'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
    commentPropName: '#comment',
    attributeNamePrefix: '',
  })

  const buf = await readFile('../books/wx/index.xml')

  const out = JSON.stringify(parser.parse(buf), null, 2)

  console.log(out);
}

main().catch(console.error)
