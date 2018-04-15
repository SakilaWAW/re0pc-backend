// 本脚本用于在每天晚上自动检测新增文章并将文章内容注入数据库

const schedule = require("node-schedule");

let rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 16;
rule.minute = 58;

const j = schedule.scheduleJob(rule, function(){
  const inject_executor = require('file_inject_executor');
});

console.log("定时任务设置完毕");