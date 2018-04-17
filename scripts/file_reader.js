"use strict";

const promisify = require('util').promisify;
const fs = require('fs');

const readDirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);

const extract = (data) => {
  const reg = /&=.*=&/;
  const reg_info = data.toString().match(reg);
  const type_tag = reg_info[0].substring(2, reg_info[0].length - 2).split(';');
  const type = type_tag[0];
  const tags = type_tag[1].split(',');
  const content = data.toString().replace(reg, '').trim();
  return {
    article: {
      title: data.filename,
      content,
      type,
      count: 0,
    },
    tag: tags,
  };
};

const readFile = async (path, file) => {
  try {
    const data = await readFileAsync(`${path}${file}`);
    data.filename = file.toString();
    const result = extract(data);
    console.log(`=======result.article.title==========${result.article.title.toString()}`);
    console.log(`=======result.article.content==========${result.article.content.toString()}`);
    console.log(`=======result.article.type==========${result.article.type.toString()}`);
    console.log(`=======result.article.count==========${result.article.count.toString()}`);
    console.log(`=======result.tag==========${result.tag.toString()}`);
  }catch(err) {
    console.log(`error in readFile():file:${file}======${err}`);
  }
};

const detect = async (path) => {
  console.log(`detect开始===设定路径为:${path}`);
  try {
    const files = await readDirAsync(path);
    const file_promises = files.map((file)=> {
      return readFile(path, file);
    });
    Promise.all(file_promises).then(()=>{console.log('所有promise完成')});
  }catch(err) {
    console.log(`error in detect():${err}`);
  }
};

module.exports = {
  detect,
};