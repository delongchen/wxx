import { createServer } from 'node:http';
import { coverHttp } from './ws';
import { app } from './rest';
import './services';
import { config } from './config';
import { connect } from "./data/redis";

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
  await startHttpServer(config.httpPort);
  await connect();
};

main().catch(console.error);
