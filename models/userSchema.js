const mongoose = require('mongoose');
const moment = require('moment');
const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    address:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    },
    image:{
        type:String
    },
    blocked:{
        type:Boolean,
        required:true
    },
    purchaseCount:{
        type:Number,
        required:true
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') }}
})

const userModel = mongoose.model('User',userSchema);

module.exports={
    userModel,
}