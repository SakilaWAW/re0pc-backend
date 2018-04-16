"use strict"

const fs = require('fs');

const detect = (path) => {
  console.log(`detect开始===设定路径为:${path}`);
  fs.readdir(path, (err, files)=>{
    if(err) {
      console.log(`red alert!发生error:${err}`);
    }else{
      return map(path, files);
    }
  });
};

// 将file内容转换为model
const map = (path, files) => {
  files.map((file)=> {
    return readFile(path, file);
  });
};

const readFile = (path, file) => {
  fs.readFile(`${path}${file}`, (err, data) => {
    if(err) {
      console.log(`alert!${err}`);
    }else {
      console.log(`文章的信息===path:${path},file:${file}`);
      const reg = /&=.*=&/;
      const reg_info = data.toString().match(reg);
      const type_tag = reg_info[0].substring(2, reg_info[0].length - 2).split(';');
      const type = type_tag[0];
      const tags = type_tag[1].split(',');
      const content = data.toString().replace(reg, '').trim();
      return {
        article: {
          title: file.toString(),
          content,
          type,
          count: 0,
        },
        tag: tags,
      };
    }
  });
};


module.exports = {
  detect,
};