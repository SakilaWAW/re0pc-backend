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

const readFileAsync = promisify(fs.readFile);

const tagPackager = (uuid, tags) => {
  return tags.map((tag) => {
    return new Tag(uuid, tag);
  });
};

const analyzeFile = async (path) => {
  try {
    const data = await readFileAsync(path);
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

module.exports = {
  analyzeFile,
};