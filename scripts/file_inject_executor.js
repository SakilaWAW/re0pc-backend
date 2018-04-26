"use strict";

const file_analyzer = require('./file_analyzer');
const db_util = require('./db_util');
const fs = require('fs');

/**
 * 将model注入到数据库中
 * @param article 经过file_analyzer.js分析出的文章模型
 */
const inject = async (article) => {
  const uuid = await db_util.queryByName(article.title);
  if (uuid === null) { // 不在数据库中 需要进行插入操作
    return await db_util.insertArticle(article);
  } else { // 原来就在数据库中 进行相应的更新操作
    article.tag = article.tag.map((tag)=>{// 替换uuid
      tag.uuid = uuid;
      return tag;
    });
    const originArticle = await db_util.queryByUUID(uuid);
    const promiseArr = [];
    if(!originArticle.contentEqualWith(article)) promiseArr.push(db_util.updateContent(uuid, article.content));
    if(!originArticle.typeEqualWith(article)) promiseArr.push(db_util.updateType(uuid, article.type));
    if(!originArticle.tagsEqualWith(article)) promiseArr.push(db_util.updateTags(uuid, article.tag));
    await Promise.all(promiseArr);
  }
};

const injectFile = (path) => {
  file_analyzer.analyzeFile(path).then((article) => {
    return inject(article);
  });
};

/**
 * 使用递归遍历指定目录下的所有.md文件
 * @param dir 指定目录
 * @return {Array} 所有.md文件的路径
 */
const extractDir = (dir) => {
  if(!dir.endsWith('/')) dir = dir + '/';
  let result = [];
  const files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {
    const filePath = dir + files[i];
    if(isValidFile(filePath)){
      result.push(filePath);
    } else if(fs.statSync(filePath).isDirectory()) {
      result = result.concat(extractDir(filePath));
    }
  }
  return result;
};

const isValidFile = (path) => {
  return fs.statSync(path).isFile() && path.endsWith('.md')
};

/**
 * 解析文件并录入
 * @param path 支持单个文件录入和文件夹录入(path为文件夹的话会将其下所有.md文件录入数据库)
 */
const exec = async (path) => {
  await db_util.sync();
  if(isValidFile(path)){
    injectFile(path);
  }else if(fs.statSync(path).isDirectory()) {
    const filePaths = extractDir(path);
    const fileNamesWithoutPath = filePaths.map((name) => {
      return name.split(/[/\\]/).pop();
    });
    const allArticlesInDB = await db_util.queryAllArticles();
    const deletePromises = allArticlesInDB.filter((article)=>{
      for(let i = 0; i< fileNamesWithoutPath.length; i++){
        if(fileNamesWithoutPath[i] === article.title) return false;
      }
      return true;
    }).map(async (article) => {
      return await db_util.deleteArticle(article.id);
    });
    const filePromises = filePaths.map(async (path) => {
      return await injectFile(path);
    });
    await Promise.all(filePromises.concat(deletePromises));
  }else{
    throw "file_inject_executor.exec()录入路径既不是md文件又不是文件夹";
  }
};

module.exports = {
  exec,
};