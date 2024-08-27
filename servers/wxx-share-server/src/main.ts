import { createServer } from 'node:http'
import { coverHttp } from './ws'
import { app } from './rest'
import './services'


const httpServer = createServer(app.callback())

const startHttpServer = (port: number) =>
  new Promise<void>(resolve => {
    httpServer.listen(port, () => {
      console.log(`server listen at ${port}`)
      resolve()
    })
  })

const main = async () => {
  coverHttp(httpServer)
  await startHttpServer(11460)
}

main().catch(console.error)
