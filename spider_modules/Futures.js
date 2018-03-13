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
//爬虫地址
const url = "http://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesDailyKLine";

class Futures{

    static async futures_all(req,res){
        let count = 0;
        await query("truncate futures");
        //先清空后开始
        let goods = await query("select * from goods");
        for(let good of goods){
            let futures = await getGoodData(good);
            if(!futures) continue;
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
                count++;
            }
        }

        if(req && req.method=="GET"){
            res.json({status:1,msg:`期货爬虫结束，本次爬虫共爬取${count}条`});
        }else{
            console.log("Data saved!");
        }
    }
}



function getGoodData(good){
    return new Promise(function(resolve,reject){
        request.get(url).query({symbol:good.api_id}).end(function(err,res){
            if(res.body){
                let futures={
                    data : res.body,//数组
                    g_id : good.id
                }
                resolve(futures);
            }else{
                resolve(false);
            }
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

module.exports= Futures;
