interface RequestInfo {
  name: string
  method: string
  payloadType?: string
  responseType?: string
}

interface TypedName {
  name: string
  t: string[]
}

type UrlPath = (string | TypedName)[]

const AllowedMethod = new Set<string>([
  'post', 'put', 'get', 'delete',
  'POST', 'PUT', 'GET', 'DELETE',
])

const fmtName = (name: string) => {
  return name.split('-')
    .map(it => it.charAt(0).toUpperCase() + it.slice(1))
    .join('')
}

const parseUrl = (url: string) => {
  const chunks = url
    .split('/')
    .filter((it) => it !== '')

  const path: UrlPath = []

  for (const chunk of chunks) {
    if (!chunk.startsWith('$')) {
      path.push(chunk)
      continue
    }

    if (chunk.startsWith("${")) {
      const content = chunk.slice(2, chunk.length - 1)
      const [name, t] = content.split(':')
      path.push({ name, t: t.split('|') })
    }
  }

  return path
}

const parsePattern = (
  urlPath: UrlPath,
  pattern: string
): RequestInfo | null => {

}

export const createApi = (url: string, pattern: string | string[]) => {
  const urlPath = parseUrl(url)
  const infoList: RequestInfo[] = []

  if (!Array.isArray(pattern)) {
    pattern = [pattern]
  }

  for (const item of pattern) {
    const info = parsePattern(urlPath, item)
    if (info !== null) {
      infoList.push(info)
    }
  }
}
