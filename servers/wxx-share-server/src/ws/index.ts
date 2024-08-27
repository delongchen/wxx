import { Server as HttpServer } from "http";
import { wss } from './instance'
import { createGroup, groupMap } from './manager'
import { WebSocket } from "ws";
import { IncomingMessage } from "node:http";


createGroup('wxx')

wss.on('connection', (
  ws: WebSocket,
  group: string,
  req: IncomingMessage
) => {
  groupMap.get(group)?.manage(ws, req)
})

export const coverHttp = (httpServer: HttpServer) => {
  httpServer.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url ?? '', 'ws://cnmd.life')
    const { pathname } = url

    if (pathname.startsWith('/group')) {
      const group = pathname.slice(7)
      if (groupMap.has(group)) {
        wss.handleUpgrade(req, socket, head, ws => {
          wss.emit(
            'connection',
            ws,
            group,
            req,
          )
        })

        return
      }
    }

    socket.destroy()
  })
}
