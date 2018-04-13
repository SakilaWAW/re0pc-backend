"use strict";

const _call_name =  async (ctx, next) => {
  const name = ctx.params.name;
  ctx.body = `hello, ${name}!`;
  await next();
};

const _hello = async (ctx, next) => {
  ctx.body = 'hello!';
  await next();
};

module.exports = {
  'GET /': _hello,
  'GET /call/:name': _call_name,
};