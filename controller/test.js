"use strict";

const _call_name =  async (ctx, next) => {
  const name = ctx.params.name;
  ctx.recallName = `miss ${name}`;
  ctx.body = `hello, ${name}!`;
  await next();
};

const _re_call = async (ctx) => {
  ctx.body += `good day.${ctx.recallName}!`;
};

const _hello = async (ctx, next) => {
  ctx.body = 'hello!';
  await next();
};

/**
 * 传入规则为：
 * 属性名为方式和url路径的拼接
 * 属性值为一个数组,数组为一个处理流
 */
module.exports = {
  'GET /': [_hello],
  'GET /call/:name':[_call_name, _re_call],
};