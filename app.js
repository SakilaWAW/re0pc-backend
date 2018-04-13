const Koa = require('koa');
const app = new Koa();

const controller = require('./controller.js')();

app.use(controller);
app.listen(3000);