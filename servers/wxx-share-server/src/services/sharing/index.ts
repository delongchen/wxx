import middlewares from "./middlewares";
import { BasicMessage } from 'wxx-protobufs/common'
import { ResponseMessage } from './types'
import router from './router'

router.add(...middlewares)

export const handleIncomingMessage = async (message: Buffer): Promise<ResponseMessage | null> => {
  const { header, body } = BasicMessage.decode(message);

  if (header === undefined) {
    return null;
  }

  return router.handle(header.endpoint, body);
}
