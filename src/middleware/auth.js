
const jwt = require("jsonwebtoken");



    let auth = async function(req,res,next){

        try{
        let token = req.headers["x-api-key"]
        if(token){
            let decodedToken = jwt.verify(token ,  "fifth project" )      
            if(decodedToken){

           req.userId = decodedToken.userId
            next()
            
            }

        }else{ return res.status(401).send({ERROR:"Token Missing"})}   




    }catch(err){
        return res.status(500).send({ERROR:err.message})}
}
   
module.exports.auth=auth