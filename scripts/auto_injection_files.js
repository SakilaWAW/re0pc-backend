/**
 * 本脚本用于设置定时任务:在每天晚上自动检测新增文章并将文章内容注入数据库
 */
const FILE_PATH = '/home/stg/WebProjects/md_files/';

const schedule = require("node-schedule");
const inject_executor = require('./file_inject_executor');

let rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 2;
rule.minute = 30;

schedule.scheduleJob(rule, function(){
  inject_executor.exec(FILE_PATH).then(()=>{
    console.log(`任务于:${new Date()}  执行...`);
  });
});

console.log(`定时任务设置完毕--定时任务时间为:每日${rule.hour}时${rule.minute}分${rule.second}秒`);