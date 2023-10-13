const mongoose = require('mongoose');
const moment= require('moment')

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    customerName:{
        type:String,
        required:true
    },
    productId: {
        type: String,
        required: true
    },
    productName:{
        type:String,
        required:true
    },
    productImage:{
        type:String,
        required:true
    },
    productPrice: {
        type: Number,
        required: true
    },
    address:{
        type:String,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    orderStatus:{
        type:String,
        required:true
    },
    
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') } }
}, {
    timestamps: true // Add timestamps option
});

const orderModel = mongoose.model('order', orderSchema);

module.exports = orderModel;
