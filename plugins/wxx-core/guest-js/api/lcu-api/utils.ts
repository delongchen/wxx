import {LcuAllowedMethod, lcuFetch, RequestBody} from "../lcu-fetch";


// from: /some/path/users/:id/info/:action
// to: {
//   id: string | number,
//   action: string | number
// }
type ExtractParams<S extends string> =
  S extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : S extends `${infer _Start}:${infer Param}`
      ? Param
      : never;

type ParamsObject<S extends string> = {
  [K in ExtractParams<S>]: string | number
};

type BuilderReturnType<S extends string> = S | ((params: ParamsObject<S>) => string)

const parseUrl = <S extends string>(template: S): BuilderReturnType<S> => {
  const chunks = template.split('/')
  const raw: string[] = []
  const paramsVec: ExtractParams<S>[] = []
  const temp: string[] = []

  const commit = () => {
    raw.push(temp.join('/'))
    temp.length = 0
    temp.push('')
  }

  for (const chunk of chunks) {
    if (chunk.startsWith(':')) {
      commit()
      paramsVec.push(chunk.slice(1) as ExtractParams<S>)
    } else {
      temp.push(chunk)
    }
  }

  commit()

  if (paramsVec.length === 0) return template

  return (params: ParamsObject<S>) => String.raw(
    { raw },
    ...paramsVec.map(param => '/' + (params[param] ?? '')),
  )
}

type FetchType<S extends string, T = unknown> =
  ExtractParams<S> extends never ?
    <RES = T>() => Promise<RES>
    :
    <RES = T>(params: ParamsObject<S>) => Promise<RES>

type FetchWithPayloadType<S extends string, P extends RequestBody, T = unknown> =
  ExtractParams<S> extends never ?
    <REQ extends P, RES = T>(payload: REQ | undefined) => Promise<RES>
    :
    <REQ extends P, RES = T>(payload: REQ | undefined, params: ParamsObject<S>) => Promise<RES>

export const api = <E extends string>(endpoint: E) => {
  const parsed = parseUrl(endpoint)

  const noPayload = <T = unknown>(method: LcuAllowedMethod) => {
    if (typeof parsed === 'string') {
      return (() => lcuFetch(endpoint, { method })) as FetchType<E, T>
    }

    return (
      (params: ParamsObject<E>) => lcuFetch(parsed(params), { method })
    ) as FetchType<E, T>
  }

  const withPayload = <
    T = unknown,
    P extends RequestBody = {}
  >(method: LcuAllowedMethod) => {
    if (typeof parsed === 'string') {
      return (
        (payload: P) => lcuFetch<T>(endpoint, {
          method,
          body: payload,
        })
      ) as FetchWithPayloadType<E, P, T>
    }

    return (
      (payload: P, params: ParamsObject<E>) => lcuFetch(
        parsed(params),
        {
          method,
          body: payload
        }
      )
    ) as FetchWithPayloadType<E, P, T>
  }

  return { noPayload, withPayload }
}
