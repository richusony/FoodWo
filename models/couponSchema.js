const mongoose = require('mongoose')
const moment = require('moment');
const { TrunkPage } = require('twilio/lib/rest/trunking/v1/trunk');

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
    },
    foodId:{
        type:String,
        required:true
    },
    discountType:{
        type:String,
        required:true
    },
    discountValue:{
        type:Number,
        required:true
    }
})

const couponModel = mongoose.model('coupon',couponSchema);

module.exports={
    couponModel
}