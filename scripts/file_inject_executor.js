"use strict";

const file_analyzer = require('./file_analyzer');
const db_util = require('./db_util');
const Article = require('../models/entity/article');

// 将model注入到数据库中
const inject = async (article) => {
  const uuid = await db_util.queryByName(article.title);
  if (uuid === null) { // 不在数据库中 进行插入操作
    return await db_util.insertArticle(article);
  } else { // 原来就在数据库中 进行相应的更新操作
    const originArticle = Article.cloneWith(await db_util.queryByUUID(uuid));
    console.log(JSON.stringify(originArticle));
    const promiseArr = [];
    console.log(`===========================uuid:${uuid}`);
    if(!originArticle.contentEqualWith(article)) promiseArr.push(db_util.updateContent(uuid, article.content));
    if(!originArticle.typeEqualWith(article)) promiseArr.push(db_util.updateType(uuid, article.type));
    if(!originArticle.tagsEqualWith(article)) promiseArr.push(db_util.updateTags(uuid, article.tag));
    await Promise.all(promiseArr);
  }
};

const path = process.argv[2];// '/home/stg/WebProjects/md_files/'

db_util.sync().then(()=>{
  return file_analyzer.analyzeFile(path);
}).then((article) => {
    console.log(`article:${article.title}已分析完毕，正在注入数据库...`);
    return inject(article);
  }).then(() => {
  console.log(`注入操作已完成`);
});

module.exports = {

};