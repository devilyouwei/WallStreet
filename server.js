let express = require("express");
let cookieParser = require('cookie-parser');
let session = require("express-session");

let app = express();

//控制器目录
const CTRL = __dirname+"/ctrl_modules/";

//引入过滤器类
let Filter = require(CTRL+"Filter.js");
//引入控制器类
let Index = require(CTRL+"Index"),
    Login = require(CTRL+"Login"),
    Admin = require(CTRL+"Admin"),
    Register = require(CTRL+"Register");

//使用express session中间件
app.use(cookieParser("devilyouwei"));
app.use(session({
  secret: 'devilyouwei',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false ,maxAge:3600000}
}));

//配置静态文件为assets目录
app.use(express.static(__dirname+"/assets"));

//模板引擎配置
app.set("view engine","jade");
app.set("views",__dirname+"/views");

//加载控制器
//get请求
app.get("/",Index.index);
app.get("/login",Login.login);
app.get("/admin",Filter.sessionAuth,Admin.admin);
app.get("/admin/cate/list",Filter.sessionAuth,Admin.cate_list);
app.get("/admin/cate/add",Filter.sessionAuth,Admin.cate_add);
app.get("/admin/cate/del/:id",Filter.sessionAuth,Admin.cate_del);
app.get("/admin/logout",Filter.sessionAuth,Admin.logout);


//post请求
app.post("/login",Login.login);
app.post("/admin/cate/add",Filter.sessionAuth,Admin.cate_add);

//启动服务：监听3000端口
app.listen(3000);
