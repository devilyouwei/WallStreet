/*
 * 数据库连接池
 * devilyouwei
 * 2018-3-8
 */
let mysql = require("mysql");  
let config = require("./dbconfig.json");
let pool = mysql.createPool(config);  

let query=function(sql,options){  

    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,conn){
            if(err){  
                throw new Error(err);
            }else{  
                conn.query(sql,options,function(err,results,fields){  
                    //释放连接  
                    conn.release();  
                    //事件驱动回调  
                    if(err){
                        throw new Error(err);
                    }
                    else{
                        resolve(results);
                    }
                });  
            }  
        })
    });  
};

module.exports=query;  
