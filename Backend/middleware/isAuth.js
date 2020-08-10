const jwt = require('jsonwebtoken');

module.exports = (req,res,next) =>{
    if(!req.get('Authorization')){
        const err = new Error("Not authenticated");
        err.statusCode = 401;
        throw err;
    }
    const token = req.get('Authorization').split(' ')[1];
    // console.log(token);

    let decodeToken;
    try{
        decodeToken = jwt.verify(token,'hsingla');
    }
    catch(err){
        err.statusCode = 500;
        throw err;
    }
    if(!decodeToken){
        const err = new Error("Not authenticated");
        err.statusCode = 401;
        throw err;
    }
    req.userId = decodeToken.userId;
    // console.log("isAuth middleware",req.userId);
    next()
}