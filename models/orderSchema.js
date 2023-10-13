const mongoose = require('mongoose')
const moment = require('moment')

const orderSchema = new mongoose.Schema({
    orderId:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    productId:{
        type:String,
        required:true
    },
    productPrice:{
        type:Number,
        required:true
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') } }

})

const orderModel = mongoose.model('order',orderSchema)

module.exports=orderModel;