const Koa = require('koa');
const router = require('koa-router')();
const app = new Koa();

app.use(async (ctx, next) => {
  ctx.body = 'yeah!';
  await next();
});

router.get('/call/:name', async (ctx, next) => {
  const name = ctx.params.name;
  ctx.body = `hello, ${name}!`;
  await next();
});

router.get('/', async(ctx, next) => {
  ctx.body = 'Hello!';
  await next();
});

app.use(router.routes());
app.listen(3000);