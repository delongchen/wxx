type IncomingMessageType = MessageEvent<{
  theme: string,
  buf: SharedArrayBuffer,
}>

const handleIncomingMessage = async (message: IncomingMessageType) => {
  const { theme, buf } = message.data;
  self.postMessage({
    theme,
    len: buf.byteLength,
  });
};

self.onmessage = handleIncomingMessage;
