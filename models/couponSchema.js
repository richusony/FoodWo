const mongoose = require('mongoose')
const moment = require('moment')

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        uppercase: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    usersLimit:{
        type:Number,
        required:true
    },
    usageLimit:{
        type:Number,
        required:true
    }
})