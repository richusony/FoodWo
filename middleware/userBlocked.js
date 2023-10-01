const express = require('express');
const route = express.Router();
const { userModel } = require('../models/userSchema')

async function isBlocked(req, res, next) {
    const userId = req.session.user?._id;
    const userdata = await userModel.findOne({ _id: userId })
    if (userdata.blocked) {
        console.log('user is blocked')
        res.redirect('/user/login')
    } else {
        console.log('user is not blocked')
        next();
    }
}

module.exports={
isBlocked
}
