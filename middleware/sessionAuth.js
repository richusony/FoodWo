const express = require('express');
const session = require('express-session');
const route = express.Router();

function adminAuth(req,res,next){
    if(req.session.admin){
        console.log("Admin is Alive...")
        next();
    }else{
        console.log("Admin is Dead...")
        res.redirect('/admin/login')
    }
}
function userAuth(req,res,next){
    if(req.session.user){
        console.log("User is Alive...")
        next();
    }else{
        console.log("User is Dead...")
        res.redirect('/user/login')
    }
}

module.exports={
    adminAuth,
    userAuth
}