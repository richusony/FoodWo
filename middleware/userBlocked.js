const express = require('express');
const route = express.Router();
const { userModel } = require('../models/userSchema')

async function isBlocked(req, res, next) {
    const userId = req.session.user?._id;
    const userdata = await userModel.findOne({ _id: userId },{address:0,email:0,password:0,phone:0,fullname:0})
    if (userdata.blocked) {
        console.log('user is blocked')
        res.redirect('/login')
    } else {
        console.log('user is not blocked')
        next();
    }
}

module.exports={
isBlocked
}
