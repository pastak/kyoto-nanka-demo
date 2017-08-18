const Koa = require('koa')
const Router = require('koa-router')
const request = require('request-promise-native')
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
      client_id: 'b38c32eeb069fcc9007e7639518ac7f72c716a5b2e84999b775f5cb5df378f8f',
      client_secret: 'abbee252cdcfbb6f4701a034d423a6b07cea9d9fc4269e36be2d5a64c513b19b',
      redirect_uri: 'http://localhost:8081/vr/index.html',
      code: reqBody.code,
      grant_type: 'authorization_code'
    },
    json: true
  })
  ctx.body = body
  next()
})

app.use(router.routes())

app.listen(8085)
