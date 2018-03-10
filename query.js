/*
 * 数据库连接池
 * devilyouwei
 * 2018-3-8
 */
var mysql=require("mysql");  
var config = require("./dbconfig.json");
var pool = mysql.createPool(config);  
var query=function(sql,options,callback){  
    pool.getConnection(function(err,conn){  
        if(err){  
            callback(err,null,null);  
        }else{  
            conn.query(sql,options,function(err,results,fields){  
                //释放连接  
                conn.release();  
                //事件驱动回调  
                callback(err,results,fields);  
            });  
        }  
    });  
};  

module.exports=query;  
