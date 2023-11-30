const mongoose = require('mongoose');
const moment = require('moment');

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    productId:{
        type:String,
        required:true
    },
    productName: {
        type: String,
        required: true
    },
    productQty: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number
    },
    paymentMethod: {
        type: String,
        required: true
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') } }
}, {
    timestamps: true
})

const invoiceModel = mongoose.model("invoice", invoiceSchema);

module.exports = {
    invoiceModel
}