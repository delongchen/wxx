import { LcuAllowedMethod, lcuFetch, RequestBody } from '../lcu-fetch';

// from: /some/path/users/:id/info/:action
// to: {
//   id: string | number,
//   action: string | number
// }
type ExtractParams<
  S extends string,
  Sep extends string = '/',
> = S extends `${infer _Start}:${infer Param}${Sep}${infer Rest}`
  ? Param | ExtractParams<Rest>
  : S extends `${infer _Start}:${infer Param}`
    ? Param
    : never;

type ParamsObject<S extends string> = {
  [K in (ExtractParams<ExtractPath<S>> | ExtractParams<ExtractSearch<S>, "&">)]: string | number;
};

type ExtractSearch<T extends string> = T extends `${infer _Path}?${infer Search}` ? Search : '';
type ExtractPath<T extends string> = T extends `${infer Path}?${infer _Search}` ? Path : T;

type BuilderReturnType<S extends string> =
  | S
  | ((params: ParamsObject<S>) => string);

  const parseUrl = <S extends string>(template: S): BuilderReturnType<S> => {
    const [basic, search] = template.split('?');
    const chunks = basic.split('/');
    const paramsVec: ExtractParams<ExtractPath<S>>[] = [];
    const searchParamsVec: ExtractParams<ExtractSearch<S>, '&'>[] = [];
  
    for (const chunk of chunks) {
      if (chunk.startsWith(':')) {
        paramsVec.push(chunk.slice(1) as ExtractParams<ExtractPath<S>>);
      }
    }
  
    if (search) {
      const searchChunks = search.split('&');
      for (const searchChunk of searchChunks) {
        if (searchChunk.startsWith(':')) {
          searchParamsVec.push(searchChunk.slice(1) as ExtractParams<ExtractSearch<S>, '&'>);
        }
      }
    }
  
    if (paramsVec.length === 0 && searchParamsVec.length === 0) return template;
  
    return (params: ParamsObject<S>) => {
      const path = chunks
        .map((chunk) => {
          if (chunk.startsWith(':')) {
            const param = chunk.slice(1) as ExtractParams<ExtractPath<S>>;
            return `/${params[param] ?? ''}`;
          }
          return `/${chunk}`;
        })
        .join('');
  
      const queryString = searchParamsVec.length > 0
        ? '?' + searchParamsVec.map(param => `${param}=${params[param] ?? ''}`).join('&')
        : '';
  
      return path + queryString;
    };
  };

type FetchType<S extends string, T = unknown> =
  ExtractParams<S> extends never
    ? <RES = T>() => Promise<RES>
    : <RES = T>(params: ParamsObject<S>) => Promise<RES>;

type FetchWithPayloadType<S extends string, P extends RequestBody, T = unknown> =
  ExtractParams<S> extends never
    ? <REQ extends P, RES = T>(payload: REQ | undefined) => Promise<RES>
    : <REQ extends P, RES = T>(payload: REQ | undefined, params: ParamsObject<S>) => Promise<RES>;

export const api = <E extends string>(endpoint: E) => {
  const parsed = parseUrl(endpoint);

  const noPayload = <T = unknown>(method: LcuAllowedMethod) => {
    if (typeof parsed === 'string') {
      return (() => lcuFetch(endpoint, { method })) as FetchType<E, T>;
    }

    return ((params: ParamsObject<E>) => lcuFetch(parsed(params), { method })) as FetchType<E, T>;
  };

  const withPayload = <T = unknown, P extends RequestBody = {}>(method: LcuAllowedMethod) => {
    if (typeof parsed === 'string') {
      return ((payload: P) =>
        lcuFetch<T>(endpoint, {
          method,
          body: payload,
        })) as FetchWithPayloadType<E, P, T>;
    }

    return ((payload: P, params: ParamsObject<E>) =>
      lcuFetch(parsed(params), {
        method,
        body: payload,
      })) as FetchWithPayloadType<E, P, T>;
  };

  return { noPayload, withPayload };
};
