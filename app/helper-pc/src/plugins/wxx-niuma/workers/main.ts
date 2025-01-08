import { createCmdMessageHandler } from './protocol';

self.onmessage = createCmdMessageHandler(
  self,
  5000,
  async (cmd, payload) => {
    if (cmd === 'echo') {
      return payload;
    }

    throw `unknown cmd: ${cmd}`;
  },
);
