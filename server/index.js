const Koa = require('koa')
const Router = require('koa-router')
const request = require('request-promise-native')
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')
const app = new Koa()
const router = new Router()

router.post('/token', bodyParser({
  enableTypes: ['json', 'form', 'text']
}), async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  let reqBody = {}
  ctx.request.body.split('&').forEach((str) => {
    const [key, value] = str.split('=')
    reqBody[key] = value
  })
  const body = await request({
    method: 'POST',
    uri: 'https://api.gyazo.com/oauth/token',
    form: {
      client_id: 'c885236b75ecd99d2f2f4c1b6be206c86dfbd08b8ea4da66df06d52742b0fb48',
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: 'https://gyazo-vr-demo.herokuapp.com/',
      code: reqBody.code,
      grant_type: 'authorization_code'
    },
    json: true
  })
  ctx.body = body
  next()
})

app.use(router.routes())
app.use(serve('./vr'))
app.use(serve('.'))

app.listen(process.env.PORT || 8085)
