import { LcuAllowedMethod, lcuFetch, RequestBody } from '../lcu-fetch';


// 提取 URL 路径中的参数名，例如 "/users/:id/posts/:postId" 提取为 "id" 和 "postId"
type ExtractUrlParams<S extends string> =
  S extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : S extends `${infer _Start}:${infer Param}`
      ? Param
      : never;

// 提取查询参数，例如 "?page&limit" 提取为 "page" 和 "limit"
type QueryParams<S extends string> =
  S extends `${infer Param}&${infer Rest}`
    ? Param | QueryParams<Rest>
    : S;

// 综合提取 URL 和查询参数
type ExtractParams<S extends string> =
  S extends `${infer Url}?${infer Query}`
    ? ExtractUrlParams<Url> | QueryParams<Query>
    : ExtractUrlParams<S>;

// 将提取出的 URL 参数和查询参数生成一个类型对象
type ParamsObject<S extends string> = {
  [K in ExtractParams<S>]: string | number
};

// 根据 URL 模板生成构建器的返回类型，如果 URL 中有参数则返回函数，否则返回原 URL 字符串
type BuilderReturnType<S extends string> = S | ((params: ParamsObject<S>) => string)

// 解析 URL 模板，将模板中的参数抽取并返回构建器函数或原 URL
const parseUrl = <S extends string>(template: S): BuilderReturnType<S> => {
  const chunks = template.split('/');  // 将 URL 按照 '/' 分割
  const raw: string[] = [];  // 用于保存 URL 的静态部分
  const paramsVec: ExtractParams<S>[] = [];  // 用于保存参数名
  const temp: string[] = [];  // 用于临时保存当前路径片段

  // 将当前片段加入静态 URL 部分
  const commit = () => {
    raw.push(temp.join('/'));
    temp.length = 0;
    temp.push('');
  };

  // 遍历 URL 模板，解析出参数和静态部分
  for (const chunk of chunks) {
    if (chunk.startsWith(':')) {  // 如果当前片段是参数
      commit();  // 处理之前的静态部分
      paramsVec.push(chunk.slice(1) as ExtractParams<S>);  // 保存参数名
    } else {
      temp.push(chunk);  // 将静态部分加入临时数组
    }
  }

  commit();  // 提交最后的静态部分

  // 如果没有参数，返回原始模板
  if (paramsVec.length === 0) return template;

  // 如果有参数，返回一个接收参数对象的函数，用于构建完整的 URL
  return (params: ParamsObject<S>) => String.raw(
    { raw },  // 将静态部分和参数插入
    ...paramsVec.map(param => '/' + (params[param] ?? '')),
  );
};

// 构建查询字符串，使用参数对象生成 "?key=value" 形式的查询参数
const buildQuery = (queryKeys: Set<string>, params: Record<string, string | number>) => {
  const items: string[] = [];
  for (const key of queryKeys) {
    const value = params[key];
    if (value !== undefined) {
      items.push(`${key}=${value}`);  // 拼接成 key=value 的形式
    }
  }
  return items.join('&');  // 将所有查询参数用 & 连接
};

// 解析 URL 模板，并处理可能存在的查询参数
const parseTemplate = <S extends string>(template: S): BuilderReturnType<S> => {
  const [url, query] = template.split('?');  // 将 URL 和查询参数分开

  const parsedUrl = parseUrl(url as S);  // 解析 URL

  // 如果没有查询参数，直接返回 URL 的构建器
  if (query === undefined || query === '') {
    return parsedUrl;
  }

  const queryKeys = new Set(query.split('&'));  // 提取查询参数的键

  // 返回一个接收参数对象的函数，用于构建完整的 URL 和查询字符串
  return (params: ParamsObject<S>) => `${
    typeof parsedUrl === 'string' ?
      parsedUrl  // 如果没有路径参数，直接使用 URL
      :
      parsedUrl(params)  // 如果有路径参数，生成路径
  }?${buildQuery(queryKeys, params)}`;  // 添加查询参数
};

// 定义无请求体的 Fetch 函数类型，根据 URL 是否有参数决定是否接收参数对象
type FetchType<S extends string, T = unknown> =
  ExtractParams<S> extends never ?
    <RES = T>() => Promise<RES>
    :
    <RES = T>(params: ParamsObject<S>) => Promise<RES>

// 定义带请求体的 Fetch 函数类型，根据 URL 是否有参数决定是否接收参数对象
type FetchWithPayloadType<S extends string, P extends RequestBody, T = unknown> =
  ExtractParams<S> extends never ?
    <REQ extends P, RES = T>(payload: REQ | undefined) => Promise<RES>
    :
    <REQ extends P, RES = T>(payload: REQ | undefined, params: ParamsObject<S>) => Promise<RES>

// API 构建器，根据传入的 endpoint 创建对应的 Fetch 方法
export const api = <E extends string>(endpoint: E) => {
  const parsed = parseTemplate(endpoint);  // 解析 endpoint 模板

  // 无请求体的 HTTP 方法
  const noPayload = <T = unknown>(method: LcuAllowedMethod, timeout?: number) => {
    if (typeof parsed === 'string') {  // 如果没有参数
      return (() => lcuFetch(endpoint, { method })) as FetchType<E, T>;
    }

    // 如果有参数，返回接收参数对象的函数
    return (
      (params: ParamsObject<E>) => lcuFetch(parsed(params), { method, timeout })
    ) as FetchType<E, T>;
  };

  // 带请求体的 HTTP 方法
  const withPayload = <
    T = unknown,
    P extends RequestBody = {}
  >(method: LcuAllowedMethod, timeout?: number) => {
    if (typeof parsed === 'string') {  // 如果没有参数
      return (
        (payload: P) => lcuFetch<T>(endpoint, {
          method,
          body: payload,
        })
      ) as FetchWithPayloadType<E, P, T>;
    }

    // 如果有参数，返回接收请求体和参数对象的函数
    return (
      (payload: P, params: ParamsObject<E>) => lcuFetch(
        parsed(params),
        {
          method,
          body: payload,
          timeout,
        },
      )
    ) as FetchWithPayloadType<E, P, T>;
  };

  return { noPayload, withPayload };  // 返回无请求体和带请求体的 Fetch 方法
};
