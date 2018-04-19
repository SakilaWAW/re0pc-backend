/**
 * 用于将文件参数化以便录入数据库
 * @module file_analyzer
 */

"use strict";
const promisify = require('util').promisify;
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const Article = require('../models/entity/article');
const Tag = require('../models/entity/tag');

// const readDirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const readStatAsync = promisify(fs.stat);

const tagPackager = (uuid, tags) => {
  return tags.map((tag) => {
    return new Tag(uuid, tag);
  });
};

const analyzeFile = async (path) => {
  try {
    const data = await readFileAsync(path);
    // const stat = await readStatAsync(path);
    // console.log(stat);
    const uuid = uuidv1();
    const fileName = path.split(/[/\\]/).pop();
    const reg_info = data.toString().match(/&=.*=&/);
    const content = data.toString().replace(/&=.*=&/, '').trim();
    const type_tag = reg_info[0].substring(2, reg_info[0].length - 2).split(';');
    const type = type_tag[0];
    const tags = tagPackager(uuid, type_tag[1].split(','));
    const article = new Article(uuid, fileName, content, type, 0, tags);
    return article;
  }catch(err) {
    console.log(`error in analyzeFile():file:${path}======${err}`);
  }
};
//
// const path = process.argv[2];
// const dbUtil = require('./db_util');
//
// dbUtil.sync()
//   .then(()=> {
//     return analyzeFile(path);
//   }).then((article)=> {
//     console.log(`即将插入的article：${article}`);
//     return dbUtil.insert(article);
//   }).then(()=> {
//     console.log('插入完成！');
//   });

// const detect = async (path) => {
//   console.log(`detect开始===设定路径为:${path}`);
//   try {
//     const files = await readDirAsync(path);
//     return files.map((file)=> {
//       return analyzeFile(path, file);
//     });
//   }catch(err) {
//     console.log(`error in detect():${err}`);
//   }
// };

module.exports = {
  analyzeFile,
};