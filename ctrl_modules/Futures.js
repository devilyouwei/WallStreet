const query = require("../query.js");

class Futures{
    //显示商品相关数据，后期调用机器学习接口
    static async index(req,res,next){
        let g_id = req.params.id;
        const sql1 = "select * from futures where g_id=?";
        let data = await query(sql1,g_id);
        const sql2 = "select * from good_cate where id=?";
        let goods = await query(sql2,g_id);
        res.render("futures",{goods:goods[0],data:data});
    }
}
module.exports=Futures
