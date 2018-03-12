const query = require("../query");
const md5 = require("md5");
const formidable = require("formidable");
const trim = require("trim");
const htmlspecialchars = require("htmlspecialchars");

class Login{
    static login(req,res,next){
        res.locals.page_title = "登录";
        if(req.method == "GET"){
            //如果已经登录则跳转到admin界面，禁止二次登录
            if(req.session.admin){
                return res.redirect("/admin");
            }

            res.render("login");
        } else if(req.method == "POST"){
            //交给表单处理登录处理
            dologin(req,res);
        }else{
            return res.send(404);
        }
    }

}

function  dologin(req,res){
    let form = new formidable.IncomingForm();
    //表单处理
    form.parse(req,function(err,fields,files){
        //字符串安全格式化
        let username = trim(htmlspecialchars(fields.username));
        let password = trim(htmlspecialchars(fields.password));
        if(!username || username=="") return res.json({status:0,msg:"用户名不得为空！"});
        if(!password || password=="") return res.json({status:0,msg:"密码不得为空！"});

        auth(username,md5(password)).then(function(id){
            if(id){
                //再次读取出具库获取admin个人信息，并存储到session
                const sql = "select * from admins where id=?";
                return query(sql,id);
            }
            else
                return Promise.reject(id);
        }).then(results=>{
            req.session.admin = results[0];
            res.json({status:1,msg:"登陆成功"});
        }).catch(id=>{
            res.json({status:0,msg:"登录失败，账号密码错误！"});
        });
    });
};


//验证
//需要异步执行
function auth(username,password){ 
    const sql = "select id from admins where username=? and password=?";

    return new Promise(function(resolve,reject){
        query(sql,[username,password]).then(results=>{
            //未查询到返回0
            if(results.length==0)
                resolve(0);
            else//查询到返回admin的id
                resolve(results[0].id);
        });
    });
}

module.exports = Login;
