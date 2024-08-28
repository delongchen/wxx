import { createServer } from 'node:http';
import { coverHttp } from './ws';
import { app } from './rest';
import './services';
import { HttpPort } from './config';

const httpServer = createServer(app.callback());

const startHttpServer = (port: number) =>
  new Promise<void>(resolve => {
    httpServer.listen(port, () => {
      console.log(`server listen at ${port}`);
      resolve();
    });
  });

const main = async () => {
  coverHttp(httpServer);
  await startHttpServer(HttpPort);
};

main().catch(console.error);
