import { Context, Middleware, ResponseMessage } from './types';

const createRouter = () => {
  const middlewareMap = new Map<string, Middleware<any>>();

  const add = (...middlewares: Middleware<any>[]) => {
    for (const middleware of middlewares) {
      middlewareMap.set(middleware.endpoint, middleware);
    }
  }

  const handle = async (endpoint: string, bytes: Uint8Array): Promise<ResponseMessage | null> => {
    const exist = middlewareMap.get(endpoint);

    if (exist === undefined) return null;

    const ctx: Context<any> = {
      data: exist.serializer.decode(bytes),
    };
    await exist.handler(ctx);

    const { result, target } = ctx;
    if (result !== undefined && target !== undefined) {
      return {
        target,
        bytes: exist.serializer.encode(result).finish(),
      };
    }

    return null;
  };

  return {
    add,
    handle,
  };
};

export default createRouter()
