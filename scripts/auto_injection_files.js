// 本脚本用于在每天晚上自动检测新增文章并将文章内容注入数据库

const schedule = require("node-schedule");
const inject_executor = require('./file_inject_executor');

let rule = new schedule.RecurrenceRule();
const md_file_path = '/home/stg/WebProjects/md_files/';

rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 19;
rule.minute = 52;

schedule.scheduleJob(rule, function(){
  inject_executor.exec(md_file_path).then(()=>{
    console.log(`任务于:${new Date()}  执行...`);
  });
});

console.log("定时任务设置完毕");