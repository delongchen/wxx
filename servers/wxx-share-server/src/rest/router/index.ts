import KoaRouter from '@koa/router'
import { summonerMap } from "../../services/lcu";
import { getIcon } from '../../services/profile-icon'


export const router = new KoaRouter()

router.options('/summoners', context => {
  context.set('Access-Control-Allow-Origin', '*')
  context.status = 204
  context.body = ''
})

router.get('/summoners', async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.body = [...summonerMap.values()]
})

router.get('/profile-icon/:id', async ctx => {
  const id = +ctx.params.id
  if (isNaN(id)) {
    ctx.status = 404
    return
  }

  const result = await getIcon(id)
  if (result === null) {
    ctx.status = 404
    return
  }

  ctx.body = result
  ctx.set('Content-Type', 'image/png')
  ctx.set('Cache-Control', 'max-age=31536000')
})
