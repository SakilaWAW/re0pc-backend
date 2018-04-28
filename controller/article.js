"use strict";

const db_util = require('../scripts/db_util');

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
    let this_year = articles[i].createdAt.getFullYear();
    cur_articles.push(articles[i]);
    if(i === articles.length-1
      || this_year !== articles[i+1].createdAt.getFullYear()){
      articlesInGroup.push({year: this_year, articles: cur_articles});
      cur_articles = [];
    }
  }
  return articlesInGroup;
};

const _get_tag_stats = async (ctx) => {
  ctx.body = await db_util.queryTagsGroups();
};

/**
 * 传入规则为：
 * 属性名为方式和url路径的拼接
 * 属性值为一个数组,数组为一个处理流
 */
module.exports = {
  'GET /article/:id': [_get_article_content],
  'GET /page/:page': [_get_articles_by_page],
  'GET /type/:type': [_get_articles_of_type],
  'GET /tag/:tag': [_get_articles_of_tag],
  'GET /stats/article': [_get_article_stats],
  'GET /stats/tag': [_get_tag_stats],
};