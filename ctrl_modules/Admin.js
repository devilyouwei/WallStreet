let query = require("../query.js");
const formidable = require("formidable");
const trim = require("trim");
const md5 = require("md5")
const htmlspecialchars = require("htmlspecialchars");
require("./Date.js");

//必须使用对象工厂函数，每次请求都要新建promise对象，否则类中static方法将导致导致数据未刷新
let getCate = function(){
    return new Promise(function(resolve,reject){
        const sql = "select * from cate order by id asc";
        query(sql).then((results)=>{
            resolve(results);
        });
    });
}

let getGoods = function(){
    return new Promise(function(resolve,reject){
        const sql = "select * from goods order by id asc";
        query(sql).then((results)=>{
            resolve(results);
        });
    });
} 


class Admin{

    static admin(req,res){
        res.locals.page_title = "华尔街数据管理系统";
        res.locals.admin = req.session.admin;
        res.render("admin");
    }

    static logout(req,res){
        req.session.admin = null;
        res.redirect("/");
    }

    //列出所有分类
    static cate_list(req,res){
        res.locals.page_title = "华尔街-分类管理"
        res.locals.admin = req.session.admin;
        getCate().then(function(data){
            res.render("admin_cate_list",{cates:data});
        });
    }

    static cate_add(req,res,next){
        res.locals.page_title = "华尔街-新增分类";
        res.locals.admin = req.session.admin;
        let edit = {
            id:0,
            name:"",
            api_name:"",
            api_url:"",
            spider_url:""
        }
        if(req.method=="GET"){
            let id = parseInt(req.params.id);
            //当前端传来id表示当前为编辑模式，读取数据库
            if(id){
                const sql = "select * from cate where id=?";
                query(sql,id).then(results=>{
                    if(results.length>0){
                        res.render("admin_cate_add",{edit:results[0]});
                    }else{
                        res.render("admin_cate_add",{edit:edit});
                    }
                });
            }else{
                res.render("admin_cate_add",{edit:edit});
            }
        }else if(req.method=="POST"){
            let form = new formidable.IncomingForm();
            form.parse(req,(err,fields)=>{
                let edit_id = parseInt(fields.edit_id);
                let insert={};
                //表单处理
                insert.name = trim(htmlspecialchars(fields.name));
                insert.api_name = trim(htmlspecialchars(fields.api_name));
                insert.api_url = trim(htmlspecialchars(fields.api_url));
                insert.spider_url = trim(htmlspecialchars(fields.spider_url));
                if(!insert.name) return res.json({status:0,msg:"分类名不得为空"});
                if(!insert.api_name) return res.json({status:0,msg:"API名不得为空"});
                if(!insert.api_url) return res.json({status:0,msg:"API路径不得为空"});
                if(!insert.spider_url) return res.json({status:0,msg:"爬虫路径不得为空"});

                //编辑模式
                if(edit_id){
                    const sql = "update cate set name=?,api_name=?,api_url=?,spider_url=? where id=?";
                    query(sql,[insert.name,insert.api_name,insert.api_url,insert.spider_url,edit_id]).then(results=>{
                        if(results.changedRows>0)
                            return res.json({status:1,msg:"分类已更新",jump:"/admin/cate/list"});
                        else
                            return res.json({status:0,msg:"分类未更新"});
                    });
                }else{//新增模式
                    const sql = "insert into cate set ?";
                    query(sql,insert).then(results=>{
                        if(results.affectedRows>0)
                            return res.json({status:1,msg:"分类已存储",jump:"/admin/cate/list"});
                        else
                            return res.json({status:0,msg:"分类未存储"});
                    });
                }
            });
        }else{
            next();
        }
    }

    static cate_del(req,res,next){
        if(req.method=="GET"){
            let id=req.params.id;
            const sql = "delete from cate where id=?";
            query(sql,id).then((results)=>{
                if(results.affectedRows>0){
                    return res.json({status:1,msg:"已删除",jump:"/admin/cate/list"});
                }else{
                    return res.json({status:0,msg:"未删除"});
                }
            });
        }else{
            next();
        }
    }

    static goods_list(req,res,next){
        res.locals.page_title = "华尔街-商品列表";
        res.locals.admin = req.session.admin;
        //使用promise更为简单
        Promise.all([getCate(),getGoods()]).then(function(data){
            res.locals.cate = data[0];
            res.locals.goods = data[1];
            res.render("admin_goods_list");
        });
    }

    static goods_add(req,res,next){
        res.locals.page_title = "华尔街-新增商品";
        res.locals.admin = req.session.admin;
        if(req.method == "GET"){
            getCate().then(data=>{
                res.render("admin_goods_add",{cates:data});
            });
        }else if(req.method == "POST"){
            let form = new formidable.IncomingForm();

            form.parse(req,(err,fields)=>{
                fields.name = trim(htmlspecialchars(fields.name));
                fields.c_id = trim(htmlspecialchars(fields.c_id));
                fields.api_id = trim(htmlspecialchars(fields.api_id));
                if(!fields.name) return res.json({status:0,msg:"商品名不得为空"});
                if(!fields.c_id) return res.json({status:0,msg:"分类不得为空"});
                if(!fields.api_id) return res.json({status:0,msg:"API ID不得为空"});

                const sql = "insert into goods set ?";
                query(sql,fields).then((results)=>{
                    if(results.affectedRows>0){
                        return res.json({status:1,msg:"已存储",jump:"/admin/goods/list"});
                    }else{
                        return res.json({status:0,msg:"存储失败"});
                    }
                });
            });

        }else{
            next();
        }
    }

    static goods_del(req,res,next){
        if(req.method=="GET"){
            let id = req.params.id;
            const sql = "delete from goods where id=?"

            //暂时默认为期货
            query("delete from futures where g_id=?",id).then(query(sql,id)).then((results)=>{
                if(results.affectedRows>0){
                    return res.json({status:1,msg:"已删除",jump:"/admin/goods/list"});
                }else{
                    return res.json({status:0,msg:"未删除"});
                }
            });
        }else{
            next();
        }
    }

    static users_list(req,res,next){
        res.locals.page_title = "华尔街-用户列表";
        res.locals.admin = req.session.admin;
        const sql = "select * from admins";
        query(sql).then((results)=>{
            res.render("admin_users_list",{users:results});
        });
    }

    static users_add(req,res,next){
        if(req.method=="GET"){
            res.locals.page_title = "华尔街-新增用户";
            res.locals.admin = req.session.admin;
            res.render("admin_users_add");
        }else if(req.method="POST"){
            let form = formidable.IncomingForm();
            form.parse(req,(err,fields)=>{
                fields.username = trim(htmlspecialchars(fields.username));
                fields.password = trim(htmlspecialchars(fields.password));
                if(!fields.username || !fields.password)
                    return res.json({status:0,msg:"账号密码不能为空"});

                fields.password = md5(fields.password);
                const sql = "insert into admins set ?"
                query(sql,fields).then((results)=>{
                    if(results.affectedRows>0){
                        return res.json({status:1,msg:"新增用户成功",jump:"/admin/users/list"});
                    }else{
                        return res.json({status:0,msg:"存储失败"});
                    }
                })
            })
        }else{
            next();
        }
    }

    static users_del(req,res,next){
        if(req.method=="GET"){
            let id = req.params.id;
            const sql = "delete from admins where id=?"
            query(sql,id).then((results)=>{
                if(results.affectedRows>0)
                    return res.json({status:1,msg:"已删除",jump:"/admin/users/list"})
                else
                    return res.json({status:0,msg:"未删除"});
            });
        }else{
            next();
        }
    }

    static async data_spider(req,res,next){
        res.locals.page_title = "华尔街-爬虫管理";
        res.locals.admin = req.session.admin;
        const sql = "select * from cate";
        let results = await query(sql);
        for(let i in results){
            let sql2 = "select count(*) as count from goods where c_id=?"
            results[i].count_goods = (await query(sql2,results[i].id))[0].count;
        }
        res.render("admin_data_spider",{cates:results});
    }

    static async load_goods(req,res,next){
        let c_id = parseInt(req.params.id);
        let results = await query("select * from cate where id=?",c_id);
        if(results.length==0)
            res.render("load/error");
        let cate = results[0];
        //根据提交的cate类型分开处理
        switch(cate.name){
            case "期货":
                load_futures(c_id,req,res,next);
                break;
            default:
                //找不到类型则报错页
                res.render("load/error");
                break;
        }
    }
}

//期货
//读取商品列表以及商品数据量，最近记录，最早记录
async function load_futures(c_id,req,res,next){
    let goods = await query("select * from goods where c_id=?",c_id);

    for(let i in goods){
        let sql1 = "select count(date) as count from futures where g_id=?"
        goods[i].count = (await query(sql1,goods[i].id))[0].count;
        if(goods[i].count>0){
            let sql2 = "select date from futures where g_id=? order by date asc";
            let dates = await query(sql2,goods[i].id);
            goods[i].oldest_date = new Date(dates[0].date).format("yyyy-MM-dd");
            goods[i].newest_date = new Date(dates[dates.length-1].date).format("yyyy-MM-dd");
        }else{
            goods[i].oldest_date = "暂无";
            goods[i].newest_date = "暂无";
        }
    }
    res.render("load/futures_list",{goods:goods});

}
module.exports=Admin;
