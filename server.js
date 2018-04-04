let express = require("express");
let cookieParser = require('cookie-parser');
let session = require("express-session");
let init = require("./init")
let app = express();

//使用express session中间件
app.use(cookieParser("devilyouwei"));
app.use(session({
    secret: 'devilyouwei',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 }
}));

//配置静态文件为assets目录
app.use(express.static(__dirname + "/assets"));
//模板引擎配置
app.set("view engine", "jade");
app.set("views", __dirname + "/views");

//初始化控制器路由
init.controller(app);
//初始化爬虫模块
init.spider(app)

//启动服务：监听3000端口
app.listen(3000);