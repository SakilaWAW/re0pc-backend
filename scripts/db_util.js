"use strict";

const Sequelize = require('sequelize');
const config = require('../config.js');

/**
 * 链接数据库,相关配置见config.js
 */
const link = () => {
  return new Sequelize(config.dbName, config.userName, config.pwd, {
    host: config.host,
    dialect: 'postgres',
    operatorsAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  });
};

const sequelize = link();
const Articles = sequelize.import(`${__dirname}/../models/articles`);
const Tags = sequelize.import(`${__dirname}/../models/tags`);
const Tag = require('../models/entity/tag');
const Article = require('../models/entity/article');

/**
 * 初始化数据库表结构
 */
const sync = async () => {
  await Articles.sync({force: false});
  await Tags.sync({force: false});
};

/**
 * 通过uuid查询tags
 * @param uuid 文章的uuid
 * @return tag数组
 */
const queryTags = async (uuid) => {
  return await sequelize.query(`select uuid, tag from tags where uuid = '${uuid}'`, { type: sequelize.QueryTypes.SELECT });
};

/**
 * 查询点击次数-通过uuid
 * @param uuid 文章uuid
 * @return 点击的次数
 */
const queryCount = async (uuid) => {
  let count = -1;
  const results = await sequelize.query(`select count from articles where id = '${uuid}'`, { type: sequelize.QueryTypes.SELECT });
  if (results !== null) count = results[0].count;
  return count;
};

/**
 * 查询信息-通过uuid
 * @param uuid 文章uuid
 * @return article对象
 */
const queryByUUID = async (uuid) => {
  const results = await sequelize.query(`select id, title, "createdAt", type, count, content from articles where id = '${uuid}'`, { type: sequelize.QueryTypes.SELECT });
  let result = results[0];
  result.tag = await queryTags(uuid);
  return Article.createWith(result);
};

/**
 * 通过文章名查询信息
 * @param articleName 文章名
 * @return 文章的uuid-如果没有文章则返回null
 */
const queryByName = async (articleName) => {
  const results = await sequelize.query(`select id from articles where title = '${articleName}'`, { type: sequelize.QueryTypes.SELECT });
  return JSON.stringify(results) === '[]' ? null : results[0].id;
};

/**
 * 更新类别
 * @param uuid 文章uuid
 * @param type 新的类别
 */
const updateType = async (uuid, type) => {
  await Articles.update({type}, {where: {id: uuid}, fields: ['type']});
};

/**
 * 更新内容
 * @param uuid 文章uuid
 * @param content 新的内容
 */
const updateContent = async (uuid, content) => {
  await Articles.update({content}, {where: {id: uuid}, fields: ['content']});
};

/**
 * 增加某篇文章的点击数
 * @param uuid 文章id
 * @param count 增加数目(暂时只用增加1)
 * @return {Promise<void>}
 */
const updateCount = async (uuid ,count) => {
  await Articles.update({count:sequelize.literal(`count +${count}`)}, {where: {id: uuid}});
};

/**
 * 插入一组tag
 * @param tags 需要插入的tag数组-结构为[{uuid:'',tag:''}..]
 */
const insertTags = async (tags) => {
  return tags.map((tag)=> {
    return Tags.create(tag);
  });
};

/**
 * 删除一组tag
 * @param tags 需要删除的tag数组-结构为[{uuid:'',tag:''}..]
 */
const deleteTags = async (tags) => {
  return tags.map((tag) => {
    return Tags.destroy({where: tag});
  });
};

/**
 * 更新标签
 * 原来没有的会增加，多余的会删除
 * @param uuid 文章uuid
 * @param tags 新的标签-形如[{uuid:'',tag:''}...],见file_analyzer.js
 */
const updateTags = async (uuid, tags) => {
  const originTags = await queryTags(uuid);
  const deleteTagArr = originTags.filter((tag)=>{
    return !Tag.createWith(tag).inArray(tags);
  });
  const insertTagArr = tags.filter((tag) => {
    return !Tag.createWith(tag).inArray(originTags);
  });
  await deleteTags(deleteTagArr);
  await insertTags(insertTagArr);
};

/**
 * 插入新的文章到数据库
 * @param article article对象-详见file_analyzer
 */
const insertArticle = async (article) => {
  await Articles.create(article);
  await insertTags(article.tag).then((promises)=>{
    return Promise.all(promises);
  });
};

/**
 * 删除特定文章
 * @param uuid 文章uuid
 */
const deleteArticle = async (uuid) => {
  await Tags.destroy({where: {uuid}});
  await Articles.destroy({where: {id: uuid}});
};

/**
 * 查询所有文章列表
 * @return {Promise<*>} 一个promise，包含了所有文章列表格式为[{id:'',title:''}...]
 */
const queryAllArticles = async () => {
  return await sequelize.query('select id, title, "createdAt", type, count from articles', { type: sequelize.QueryTypes.SELECT });
};

/**
 * 查询某一类别下的所有文章
 * @param type 目标类别
 * @return {Promise<*>} [{id,title,createdAt}...]
 */
const queryArticlesOfType = async (type) => {
  return await sequelize.query(`select id, title, "createdAt" from articles where type='${type}'`, { type: sequelize.QueryTypes.SELECT });
};

/**
 * 查询含有某一个标签的所有文章
 * @param tag 目标标签
 * @return {Promise<*>} [{id,title,createdAt}...]
 */
const queryArticlesOfTag = async (tag) => {
  return await sequelize.query(`select a.id, a.title, a."createdAt" from articles as a,tags as t where t.tag = '${tag}' and t.uuid = a.id`, { type: sequelize.QueryTypes.SELECT });
};

/**
 * 按年份顺序查询文章
 * @return {Promise<*>} 按年份顺序返回 [{id,title,createdAt}...]
 */
const queryArticlesOrderByYear = async () => {
  return await sequelize.query('select id, title, "createdAt" from articles order by "createdAt"', { type: sequelize.QueryTypes.SELECT });
};

/**
 * 查询各tag情况
 * @return {Promise<*>} [{tag,数量}...]
 */
const queryTagsGroups = async () => {
  return await sequelize.query('select tag,count(*) from tags group by tag', { type: sequelize.QueryTypes.SELECT });
};

/**
 * 查询文章总数
 * @return {Promise<*>}
 */
const queryArticleNum = async () => {
  const res = await sequelize.query('select count(*) from articles', { type: sequelize.QueryTypes.SELECT });
  return res[0].count;
};

/**
 * 取某一页的文章-采用后台分页
 * @param page 页数
 * @param limit 每页的数量
 * @return {Promise<void>} article对象数组-[{id,title,createdAt,type,count,content}...]
 */
const queryArticleByPage = async (page, limit) => {
  return await sequelize.query(`select id, title, "createdAt", type, count, content from 
                                    (
                                        select *,
                                               row_number() over(order by "createdAt" desc) as rowNum
                                        from articles
                                    )a
                                    where rowNum between ${(page-1)*limit+1} and ${page*limit}`, { type: sequelize.QueryTypes.SELECT });
};

/**
 * 查询类别情况
 * @return {Promise<*>} [{type,count}...]
 */
const queryTypeGroups = async () => {
  return await sequelize.query('select type, count(*) from articles group by type', { type: sequelize.QueryTypes.SELECT });
};

module.exports = {
  sync,
  queryByUUID,
  queryCount,
  queryByName,
  updateType,
  updateContent,
  updateCount,
  updateTags,
  deleteArticle,
  queryTags,
  deleteTags,
  insertArticle,
  queryAllArticles,
  queryArticlesOfType,
  queryArticlesOfTag,
  queryArticlesOrderByYear,
  queryTagsGroups,
  queryArticleNum,
  queryArticleByPage,
  queryTypeGroups,
};