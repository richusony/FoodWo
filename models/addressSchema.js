const mongoose = require('mongoose');
const moment = require('moment');

const addressSchema = new mongoose.Schema({
    userId:{
        type:String, 
        required:true,
        unique:true
    },
    address1:{
        type:String,
        required:true
    },
    address2:{
        type:String,
    },
    address3:{
        type:String,
    }
})

const addressModel = mongoose.model('address',addressSchema);

module.exports={
    addressModel
}