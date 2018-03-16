const query = require("../query.js");
require("./Date.js");

class Futures{
    //显示商品相关数据，后期调用机器学习接口
    static async index(req,res,next){
        let g_id = req.params.id;
        const sql = "select * from good_cate where id=? limit 1";
        let goods = await query(sql,g_id);
        //找不到商品返回主页
        if(goods.length == 0){
            return res.redirect("/");
        }else{
            res.render("futures",{goods:goods[0]});
        }
    }

    static async data(req,res,next){
        let g_id = req.params.id;
        const sql = "select * from futures where g_id=? order by date asc";
        let data = await query(sql,g_id);
        for(let i in data){
            data[i].date = new Date(data[i].date).format("yyyy-MM-dd");
        }
        if(data.length > 0)
            return res.json({status:1,msg:"商品数据获取成功",data:data});
        else
            return res.json({status:0,msg:"暂无该商品数据！"});
    }
}
module.exports=Futures
