/*
 * 期货爬虫模块
 * devilyouwei
 * v-0.0.1
 * 2018-3-6
 * Released under MIT license
 * 爬虫爬取过去至今的每日期货数据
 */

let request = require("superagent");
let query = require("../query");


(async ()=>{ 
    let goods = await query("select * from goods");
    for(let good of goods){
        let futures = await getGoodData(good);
        let g_id = futures.g_id;
        let data = futures.data;
        for(let f of data){
            let insert={
                g_id:g_id,
                date:f[0],
                open_price:f[1],
                max_price:f[2],
                min_price:f[3],
                latest_price:f[4],
                volume:f[5]
            }
            let results = await insertData(insert);
            console.log(results);
        }
    }
})();

function getGoodData(good){
    const url = "http://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesDailyKLine";
    return new Promise(function(resolve,reject){
        request.get(url).query({symbol:good.api_id}).end(function(err,res){
            let futures={
                data : res.body,//数组
                g_id : good.id
            }
            resolve(futures);
        });
    });
}

//插入到数据库
function insertData(insert){
    return new Promise(function(resolve,reject){
        const sql = "insert into futures set ?"
        query(sql,insert).then(results=>{
            resolve(results);
        });
    });
}

