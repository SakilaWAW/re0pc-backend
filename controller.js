const fs = require('fs');
const router = require('koa-router')();

// 取得path路径下所有js文件
const get_modules = (path) => {
  const files = fs.readdirSync(`${__dirname}/${path}`);
  return files.filter((f) => {
    return f.endsWith('.js');
  });
};

// 注入模块
const inject_modules = (js_files) => {
  for (let f of js_files) {
    console.log(`start process controller ${f}...`);

    let mapping = require(`${__dirname}/controller/${f}`);
    for (let func in mapping) {
      if (func.startsWith('GET')) {
        const map_url = func.substring(4);
        router.get(map_url, ...mapping[func]);
        console.log(`AHA, ${func}(GET) is inject!`);
      } else if (func.startsWith('POST')) {
        const map_url = func.substring(5);
        router.post(map_url, ...mapping[func]);
        console.log(`AHA, ${func}(POST) is inject!`);
      }else {
        console.log(`alert! there is something wrong with ${func}`);
      }
    }
  }
  return router.routes();
};

module.exports = (path) => {
  const target_path = path || 'controller';
  return inject_modules(get_modules(target_path));
};