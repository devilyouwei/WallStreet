module.exports = register

var mongo = require("mongodb").MongoClient;

function register(req,res,next){
    if(req.method == "GET")
        res.render("register");
    else if(req.method == "POST"){
        //此处需要做安全验证，略
        save(req.body,function(){
            res.redirect("/login");
        });
    }else{
        res.send(404);
    }
}

//保存用户注册信息
function save(data,fn){
    mongo.connect('mongodb://localhost:27017',function(err,client){
        if(err) throw err;
        console.log("Connected mongo");

        db = client.db("test");

        var collection = db.collection('users');
        collection.insertMany([data],function(err,res){
            if(err) throw err;
            else console.log("1 user inserted");
            client.close();
            fn();
        });
    })
}
