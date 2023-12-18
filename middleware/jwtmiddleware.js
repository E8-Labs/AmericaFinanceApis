const JWT = require("jsonwebtoken");


const verifyJwtToken = (req, response, next)=>{
    const authHeaders = req.headers['authorization'];
    console.log(authHeaders);
    if(typeof authHeaders !== 'undefined'){
        const parts = authHeaders.split(" ");
        req.token = parts[1];
        next();
    }
    else{
        response.send({status: false, message: "Unauthenticated user", data: null});
    }
}

module.exports = {verifyJwtToken};