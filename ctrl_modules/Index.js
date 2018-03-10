let query = require("../query.js");

class Index{

    static index(req,res,next){
        res.render("index");
    }
}
module.exports=Index;
