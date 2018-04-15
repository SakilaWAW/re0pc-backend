"use strict";

const fs = require('fs');
const Sequelize = require('sequelize');
const config = require('../config.js');
const uuidv1 = require('uuid/v1');

// 链接数据库
const sequelize = new Sequelize(config.dbName, config.userName, config.pwd, {
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

let Article = sequelize.import(`${__dirname}/../models/article`);
let Tags = sequelize.import(`${__dirname}/../models/tags`);

const create_func = async () => {
  await Article.sync({force: false});
  await Tags.sync({force: false});
  testData();
};

const testData = async () => {
  const uuid1 = uuidv1();
  const uuid2 = uuidv1();
  await Article.create({
    id: uuid1,
    title: '标题在这里1',
    content: '内容在这里，mixed with English.',
    type: '读书笔记',
    count: 0,
  }).then(() => {
    console.log('插入了一条数据');
  });

  await Article.create({
    id: uuid2,
    title: '标题在这里2',
    content: '内容在这里，mixed with English.',
    type: '读书笔记',
    count: 0,
  }).then(() => {
    console.log('又插入了一条数据');
  });

  Tags.create({
    uuid: uuid1,
    tag: '神奇',
  });
  Tags.create({
    uuid: uuid1,
    tag: '奇幻',
  });
  Tags.create({
    uuid: uuid2,
    tag: '穿越',
  });
  Tags.create({
    uuid: uuid2,
    tag: '奇幻',
  }).then(() => {
    console.log('Tags插入了一条数据');
  });
};

create_func().then(()=> {console.log('promise完成')});

// 将file内容转换为model
const map = (file) => {

};

// 将model注入到数据库中
const inject = (model) => {

};

const exec = (file) => {
  inject(map(file));
};

module.exports = {
  exec,
};