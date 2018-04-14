/**
 * 初始化网站模块 
 * devilyouwei
 * 2018-3-13
 * MIT license
 * @returns {module}
 */

//控制器目录
const CTRL = __dirname+"/ctrl_modules/";
const SPIDER = __dirname+"/spider_modules/";

//初始化对象
let init = {}

//初始化控制器与路由
init.controller = function(app){
    //引入过滤器类
    let Filter = require(CTRL+"Filter");
    //引入控制器类
    let Index = require(CTRL+"Index"),
        Login = require(CTRL+"Login"),
        Admin = require(CTRL+"Admin"),
        Futures = require(CTRL+"Futures");


    //加载路由与控制器
    //get请求
    app.get("/",Index.index);
    app.get("/login",Login.login);
    app.get("/admin",Filter.sessionAuth,Admin.admin);
    app.get("/admin/cate/list",Filter.sessionAuth,Admin.cate_list);
    app.get("/admin/cate/add/:id",Filter.sessionAuth,Admin.cate_add);
    app.get("/admin/cate/del/:id",Filter.sessionAuth,Admin.cate_del);
    app.get("/admin/goods/list",Filter.sessionAuth,Admin.goods_list);
    app.get("/admin/goods/add",Filter.sessionAuth,Admin.goods_add);
    app.get("/admin/goods/del/:id",Filter.sessionAuth,Admin.goods_del);
    app.get("/admin/users/list",Filter.sessionAuth,Admin.users_list);
    app.get("/admin/users/add",Filter.sessionAuth,Admin.users_add);
    app.get("/admin/users/del/:id",Filter.sessionAuth,Admin.users_del);
    app.get("/admin/data/spider",Filter.sessionAuth,Admin.data_spider);
    app.get("/admin/data/train/:id",Filter.sessionAuth,Admin.data_train);
    app.get("/admin/load/goods/:id",Filter.sessionAuth,Admin.load_goods);
    app.get("/admin/logout",Filter.sessionAuth,Admin.logout);
    //首页查询
    app.get("/search",Index.search);
    //期货数据展示
    app.get("/futures/:id",Futures.index);
    //ajax
    app.get("/futures/data/:id/:limit",Futures.data); 
    app.get("/futures/predict/:id/",Futures.predict); 

    //post请求
    app.post("/login",Login.login);
    app.post("/admin/cate/add",Filter.sessionAuth,Admin.cate_add);
    app.post("/admin/goods/add",Filter.sessionAuth,Admin.goods_add);
    app.post("/admin/users/add",Filter.sessionAuth,Admin.users_add);
}

init.spider = function(app){
    //引入过滤器类
    let Filter = require(CTRL+"Filter");
    //引入爬虫类
    let Futures = require(SPIDER+"Futures");

    app.get("/spider/futures/refresh",Filter.sessionAuth,Futures.refresh);
}

module.exports=init;
