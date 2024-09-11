import { BasicMessage } from 'wxx-protobufs/common'
import {Context, Middleware, ResponseMessage, ResponseTarget} from './types';

const createRouter = () => {
  const middlewareMap = new Map<string, Middleware<any>>();

  const add = (...middlewares: Middleware<any>[]) => {
    for (const middleware of middlewares) {
      middlewareMap.set(middleware.endpoint, middleware);
    }
  }

  const handle = async (bytes: Uint8Array): Promise<ResponseMessage | null> => {
    const { header, body } = BasicMessage.decode(bytes);
    if (header === undefined) {
      return null;
    }

    const { endpoint } = header
    const exist = middlewareMap.get(endpoint);

    if (exist === undefined) return null;

    const decodedData = exist.serializer.decode(body);
    const ctx: Context<any> = {
      data: decodedData,
      broadcast: (data?: any) => {
        ctx.result = data ?? decodedData;
        ctx.target = ResponseTarget.All;
      },
    };
    await exist.handler(ctx);

    const { result, target } = ctx;
    if (result !== undefined && target !== undefined) {
      if (result === decodedData) return { bytes, target }

      return {
        target,
        bytes: BasicMessage.encode({
          header,
          body: exist.serializer.encode(result).finish(),
        }).finish(),
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
