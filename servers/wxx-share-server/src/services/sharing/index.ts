import middlewares from "./middlewares";
import { ResponseMessage } from './types'
import router from './router'

router.add(...middlewares)

export const handleIncomingMessage = async (message: Buffer): Promise<ResponseMessage | null> => {
  return router.handle(message);
}
