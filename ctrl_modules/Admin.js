let query = require("../query.js");
const formidable = require("formidable");
const trim = require("trim");
const htmlspecialchars = require("htmlspecialchars");

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
        const sql = "select * from cate";
        query(sql,function(err,results,fields){
            res.render("admin_cate_list",{cates:results});
        });
    }

    static cate_add(req,res,next){
        res.locals.page_title = "华尔街-新增分类";
        res.locals.admin = req.session.admin;
        if(req.method=="GET"){
            console.log("get");
            res.render("admin_cate_add");
        }else if(req.method=="POST"){
            console.log("post");
            let form = new formidable.IncomingForm();
            form.parse(req,function(err,fields){
                fields.name = trim(htmlspecialchars(fields.name));
                fields.api_name = trim(htmlspecialchars(fields.api_name));
                fields.api_url = trim(htmlspecialchars(fields.api_url));
                if(!fields.name) return res.json({status:0,msg:"分类名不得为空"});
                if(!fields.api_name) return res.json({status:0,msg:"API名不得为空"});
                if(!fields.api_url) return res.json({status:0,msg:"API路径不得为空"});

                const sql = "insert into cate set ?";
                query(sql,fields,function(err,results,fields){
                    if(results.affectedRows>0)
                        return res.json({status:1,msg:"分类已存储"})
                    else
                        return res.json({status:0,msg:"分类未存储"})
                });
            });
        }else{
            next();
        }
    }

    static cate_del(req,res,next){
        if(req.method=="GET"){
            let id=req.params.id;
            console.log(id);
            const sql = "delete from cate where id=?";
            query(sql,id,function(err,results,fields){
                console.log(results);
            });
        }else{
            
        }
    }
}

module.exports=Admin;
