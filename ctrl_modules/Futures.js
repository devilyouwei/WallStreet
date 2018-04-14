const query = require("../query.js");
require("./Date.js");
const exec = require("child_process").exec;

class Futures{
    //显示商品相关数据，后期调用机器学习接口
    static async index(req,res,next){
        let g_id = req.params.id;
        const sql = "select * from good_cate where id=? limit 1";
        let goods = (await query(sql,g_id))[0];
        res.locals.page_title="可视化数据-"+goods.name;
        //找不到商品返回主页
        if(goods.length == 0)
            return res.redirect("/");
        else
            return res.render("futures",{goods:goods});
    }

    static async data(req,res,next){
        let g_id = parseInt(req.params.id);
        let limit = parseInt(req.params.limit);
        const sql = "select * from futures where g_id=? order by date desc limit "+limit;
        let data = (await query(sql,g_id)).reverse();
        for(let i in data){
            data[i].date = new Date(data[i].date).format("yyyy-MM-dd");
        }
        if(data.length > 0)
            return res.json({status:1,msg:"商品数据获取成功",data:data});
        else
            return res.json({status:0,msg:"暂无该商品数据！"});
    }

    static async predict(req,res,next){
        let g_id = parseInt(req.params.id);
        let cmd = "python tf_modules/predict_model.py "+g_id;
        exec(cmd,function(error,stdout,stderr){
            if(error) {
                res.json({status:0,msg:stderr});
            }else{
                res.json({status:1,msg:"预测完成",data:stdout});
            }
        });
    }
}
module.exports=Futures
