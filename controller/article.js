"use strict";

const db_util = require('../scripts/db_util');

const _add_cors_tags = async (ctx, next) => {
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  ctx.response.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  await next();
};

const _get_article_content = async (ctx) => {
  const result = await db_util.queryByUUID(ctx.params.id);
  ctx.body = purifyDateAndTitle(result);
};

const _get_articles_by_page = async (ctx) => {
  const total_num = await db_util.queryArticleNum();
  let articles = await db_util.queryArticleByPage(ctx.params.page, 10);
  ctx.body = {
    articles: purifyDateAndTitle(articles),
    total_page: Math.ceil(total_num/10),
  };
};

const _get_articles_of_type = async (ctx) => {
  const articles = await db_util.queryArticlesOfType(ctx.params.type);
  ctx.body = purifyDateAndTitle(articles);
};

const _get_articles_of_tag = async (ctx) => {
  const articles = await db_util.queryArticlesOfTag(ctx.params.tag);
  ctx.body = purifyDateAndTitle(articles);
};

const _get_article_stats = async (ctx) => {
  let articles = await db_util.queryArticlesOrderByYearDesc();
  ctx.body = {
    total: articles.length,
    articles: combine_articles_by_years(articles),
  };
};

const _get_tag_stats = async (ctx) => {
  ctx.body = await db_util.queryTagsGroups();
};

const _read_article = async (ctx) => {
  await db_util.updateCount(ctx.params.id, 1);
  ctx.response.status = 204;
};

const _get_type_status = async (ctx) => {
  ctx.body = await db_util.queryTypeGroups();
};

const combine_articles_by_years = (articles) => {
  if(articles.length === 0) return {};
  const articlesInGroup = [];
  let cur_articles = [];
  for (let i = 0 ;i < articles.length; i++) {
    let article = articles[i];
    let this_year = article.createdAt.getFullYear();
    let this_month = article.createdAt.getMonth()+1;
    let this_day = article.createdAt.getDate();
    cur_articles.push(article);
    if(i === articles.length-1
      || this_year !== articles[i+1].createdAt.getFullYear()){
      articlesInGroup.push({year: this_year, articles: cur_articles});
      cur_articles = [];
    }
    const articleMonth = this_month >= 10 ? this_month : `0${this_month}`;
    const articleDay = this_day >= 10 ? this_day : `0${this_day}`;
    article.createdAt = `${articleMonth}-${articleDay}`;
    article.title = article.title.slice(0,-3);
  }
  return articlesInGroup;
};

const purifyDateAndTitle = (article) => {
  if(Object.prototype.toString.call(article) === '[object Array]') {
    article.map(art=>{
      purifySingleDateAndTitle(art);
    });
    return article;
  }
  else return purifySingleDateAndTitle(article);
};

const purifySingleDateAndTitle = (article) => {
  article.createdAt = `${article.createdAt.getFullYear()}-${article.createdAt.getMonth()+1}-${article.createdAt.getDate()}`;
  article.title = article.title.slice(0,-3);
  return article;
};

/**
 * 传入规则为：
 * 属性名为方式和url路径的拼接
 * 属性值为一个数组,数组为一个处理流
 */
module.exports = {
  'GET /api/v1/article/:id': [_add_cors_tags, _get_article_content],
  'GET /api/v1/page/:page': [_add_cors_tags, _get_articles_by_page],
  'GET /api/v1/type/:type': [_add_cors_tags, _get_articles_of_type],
  'GET /api/v1/tag/:tag': [_add_cors_tags, _get_articles_of_tag],
  'GET /api/v1/stats/article': [_add_cors_tags, _get_article_stats],
  'GET /api/v1/stats/tag': [_add_cors_tags, _get_tag_stats],
  'GET /api/v1/read/:id': [_add_cors_tags, _read_article],
  'GET /api/v1/stats/type': [_add_cors_tags, _get_type_status],
};