let query = require("../query.js");
let formidable = require("formidable")

class Index{

    static async index(req,res,next){
        const sql = "select * from cate";
        let results = await query(sql);
        res.locals.page_title="华尔街-首页"
        res.render("index",{cates:results});
    }

    //查询商品
    static async search(req,res,next){
        let g_name =  req.query.g_name;
        res.locals.page_title = "华尔街-搜索："+g_name;
        let c_id =  parseInt(req.query.c_id);
        let sql = `select * from goods where name LIKE '%${g_name}%'`;
        if(c_id)
            sql+=`and c_id=${c_id}`;
        let results = await query(sql);
        res.render("index_search",{goods:results,search:g_name});
    }
}
module.exports=Index;
