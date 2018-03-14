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
//爬虫API（新浪）地址
const all_url = "http://stock2.finance.sina.com.cn/futures/api/json.php/IndexService.getInnerFuturesDailyKLine";

class Futures{

    /*
     * 用于刷新数据
     * 注：不应插入重复数据，需要排查
     */
    static async refresh(req,res){
        let count_update = 0;
        //查询需要和更新的商品
        let goods = await query("select * from goods");
        //遍历商品，每个都要更新到今天
        for(let good of goods){

            let data = await getGoodData(good);//爬虫
            if(!data) continue;//空数据跳过

            let g_id = good.id;

            //清点本地数据量
            let count_local = (await query("select count(*) as count from futures where g_id=? order by date asc",g_id))[0].count
            //清点最新数据量
            let count_api = data.length;

            console.log(count_local);
            console.log(count_api);
            //如果本地数据量=API数据量，表示不需要插入，跳过本次循环
            if(count_local == count_api) continue;

            for(let i in data){
                //本地已有数据的不做插入
                if(i <= (count_local-1)) continue;
                let insert={
                    g_id:g_id,
                    date:data[i][0],
                    open_price:data[i][1],
                    max_price:data[i][2],
                    min_price:data[i][3],
                    latest_price:data[i][4],
                    volume:data[i][5]
                }
                let results = await insertData(insert);
                count_update++;
            }
        }

        if(req && req.method=="GET"){
            res.json({status:1,msg:`期货爬虫结束，本次爬虫共更新${count_update}条`});
        }else{
            console.log("Data saved!");
        }
    }

}



function getGoodData(good){
    return new Promise((resolve,reject)=>{
        request.get(all_url).query({symbol:good.api_id}).end((err,res)=>{
            resolve(res.body);
        });
    });
}

//插入到数据库
function insertData(insert){
    return new Promise((resolve,reject)=>{
        const sql = "insert into futures set ?"
        query(sql,insert).then(results=>{
            resolve(results);
        });
    });
}

module.exports= Futures;
