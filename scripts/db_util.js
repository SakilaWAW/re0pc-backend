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

// queryTags('f84258e0-4381-11e8-b077-db0393b0d3db').then((res)=>{
//   console.log(`queryTags完成,结果是${JSON.stringify(res)}`);
// });

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
  const results = await sequelize.query(`select * from articles where id = '${uuid}'`, { type: sequelize.QueryTypes.SELECT });
  let result = results[0];
  result.tag = await queryTags(uuid);
  return result;
};

// queryByUUID("4b8d53b0-43cd-11e8-8f43-d56b043d36a4").then((res)=>{
//   console.log(res);
// });

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

// updateType("7f70c560-4303-11e8-bb7e-6d8bed90d435", '实用技能').then(() => {
//   console.log('updateType操作完成！');
// }).catch((err)=> {
//   console.log(`出错了！err：${err}`)
// });

/**
 * 更新内容
 * @param uuid 文章uuid
 * @param content 新的内容
 */
const updateContent = async (uuid, content) => {
  await Articles.update({content}, {where: {id: uuid}, fields: ['content']});
};

// updateContent("7f70c560-4303-11e8-bb7e-6d8bed90d435", '咔咔咔咔就变了').then(() => {
//   console.log('updateContent操作完成！');
// }).catch((err)=> {
//   console.log(`出错了！err：${err}`)
// });

// 更新点击数
const updateCount = async (uuid ,count) => {
  await Articles.update({count}, {where: {id: uuid}, fields: ['count']});
};

// updateCount("7f70c560-4303-11e8-bb7e-6d8bed90d435", 3).then(() => {
//   console.log('updateCount操作完成！');
// }).catch((err)=> {
//   console.log(`出错了！err：${err}`)
// });

/**
 * 插入一组tag
 * @param tags 需要插入的tag数组-结构为[{uuid:'',tag:''}..]
 */
const insertTags = async (tags) => {
  return tags.map((tag)=> {
    console.log(`insertTags():${JSON.stringify(tag)}`);
    return Tags.create(tag);
  });
};

/**
 * 删除一组tag
 * @param tags 需要删除的tag数组-结构为[{uuid:'',tag:''}..]
 */
const deleteTags = async (tags) => {
  return tags.map((tag) => {
    console.log(`deleteTags():${JSON.stringify(tag)}`);
    return Tags.destroy({where: tag});
  });
};

/**
 * TODO 逻辑有待深究
 * 更新标签
 * 原来没有的会增加，多余的会删除
 * @param uuid 文章uuid
 * @param tags 新的标签-形如[{uuid:'',tag:''}...],见file_analyzer.js
 */
const updateTags = async (uuid, tags) => {
  const originTags = await queryTags(uuid);
  tags = tags.map((tag)=>{// 将需要插入的tag的uuid换为以前的
    tag.uuid = uuid;
    return tag;
  });
  const deleteTagArr = originTags.filter((tag)=>{
    return !Tag.createWith(tag).inArray(tags);
  });
  const insertTagArr = tags.filter((tag) => {
    return !Tag.createWith(tag).inArray(originTags);
  });
  console.log(`deleteTags:${JSON.stringify(deleteTagArr)}\ninsertTags:${JSON.stringify(insertTagArr)}`);
  await deleteTags(deleteTagArr);
  await insertTags(insertTagArr);
};

/**
 * 插入新的文章到数据库
 * @param article article对象-详见file_analyzer
 */
const insertArticle = async (article) => {
  console.log(`即将插入的uuid为：${article.id}`);
  await Articles.create(article);
  await insertTags(article.tag).then((promises)=>{
    return Promise.all(promises);
  }).then(()=>{
    console.log('新增操作执行完毕');
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

// deleteArticle("7f70c560-4303-11e8-bb7e-6d8bed90d435").then(() => {
//   console.log('deleteArticle操作完成！');
// }).catch((err)=> {
//   console.log(`出错了！err：${err}`)
// });

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
};