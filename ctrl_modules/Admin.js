let query = require("../query.js");
const formidable = require("formidable");
const trim = require("trim");
const md5 = require("md5")
const htmlspecialchars = require("htmlspecialchars");

//必须使用对象工厂函数，每次请求都要新建promise对象，否则类中static方法将导致导致数据未刷新
let getCate = function(){
    return new Promise(function(resolve,reject){
        const sql = "select * from cate";
        query(sql).then((results)=>{
            resolve(results);
        });
    });
}

let getGoods = function(){
    return new Promise(function(resolve,reject){
        const sql = "select * from goods";
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
        if(req.method=="GET"){
            res.render("admin_cate_add");
        }else if(req.method=="POST"){
            let form = new formidable.IncomingForm();
            form.parse(req,(err,fields)=>{
                fields.name = trim(htmlspecialchars(fields.name));
                fields.api_name = trim(htmlspecialchars(fields.api_name));
                fields.api_url = trim(htmlspecialchars(fields.api_url));
                if(!fields.name) return res.json({status:0,msg:"分类名不得为空"});
                if(!fields.api_name) return res.json({status:0,msg:"API名不得为空"});
                if(!fields.api_url) return res.json({status:0,msg:"API路径不得为空"});

                const sql = "insert into cate set ?";
                query(sql,fields).then((results)=>{
                    if(results.affectedRows>0)
                        return res.json({status:1,msg:"分类已存储",jump:"/admin/cate/list"});
                    else
                        return res.json({status:0,msg:"分类未存储"});
                });
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
            console.log(id);
            query(sql,id).then((results)=>{
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
}

module.exports=Admin;
