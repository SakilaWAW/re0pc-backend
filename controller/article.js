"use strict";

const db_util = require('../scripts/db_util');

const _add_cors_tags = async (ctx, next) => {
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  ctx.response.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  await next();
};

const _get_article_content = async (ctx) => {
  ctx.body = await db_util.queryByUUID(ctx.params.id);
};

const _get_articles_by_page = async (ctx) => {
  const total_num = await db_util.queryArticleNum();
  let articles = await db_util.queryArticleByPage(ctx.params.page, 10);
  ctx.body = {
    articles,
    total_page: Math.ceil(total_num/10),
  };
};

const _get_articles_of_type = async (ctx) => {
  ctx.body = await db_util.queryArticlesOfType(ctx.params.type);
};

const _get_articles_of_tag = async (ctx) => {
  ctx.body = await db_util.queryArticlesOfTag(ctx.params.tag);
};

const _get_article_stats = async (ctx) => {
  let articles = await db_util.queryArticlesGroupByYear();
  ctx.body = {
    total: articles.length,
    articles: combine_articles_by_years(articles),
  };
};

const combine_articles_by_years = (articles) => {
  if(articles.length === 0) return {};
  const articlesInGroup = [];
  let cur_articles = [];
  for (let i = 0 ;i < articles.length; i++) {
    let article = articles[i];
    let this_year = article.createdAt.getFullYear();
    cur_articles.push(article);
    if(i === articles.length-1
      || this_year !== articles[i+1].createdAt.getFullYear()){
      articlesInGroup.push({year: this_year, articles: cur_articles});
      cur_articles = [];
    }
    article.createdAt = `${article.createdAt.getMonth()}-${article.createdAt.getDay()}`;
    article.title = article.title.slice(0,-3);
  }
  return articlesInGroup;
};

const _get_tag_stats = async (ctx) => {
  ctx.body = await db_util.queryTagsGroups();
};

const _read_article = async (ctx) => {
  await db_util.updateCount(ctx.params.id, 1);
  ctx.response.status = 204;
};

/**
 * 传入规则为：
 * 属性名为方式和url路径的拼接
 * 属性值为一个数组,数组为一个处理流
 */
module.exports = {
  'GET /article/:id': [_add_cors_tags, _get_article_content],
  'GET /page/:page': [_add_cors_tags, _get_articles_by_page],
  'GET /type/:type': [_add_cors_tags, _get_articles_of_type],
  'GET /tag/:tag': [_add_cors_tags, _get_articles_of_tag],
  'GET /stats/article': [_add_cors_tags, _get_article_stats],
  'GET /stats/tag': [_add_cors_tags, _get_tag_stats],
  'GET /read/:id': [_add_cors_tags, _read_article],
};