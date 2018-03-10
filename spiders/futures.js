/*
 * 期货爬虫模块
 * devilyouwei
 * v-0.0.1
 * 2018-3-6
 * Released under MIT license
 * 爬虫爬取过去2005至今的每日期货数据
 */

var request = require("superagent");
var url = "http://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesDailyKLine";
request.get(url).query({symbol:"M0"}).end(function(err,res){
    console.log(res.body[0]);
});
