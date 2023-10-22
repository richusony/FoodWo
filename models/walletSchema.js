const mongoose = require('mongoose');
const moment = require('moment');

const walletSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique:true
    },
    balance: {
        type: Number,
        required: true
    },
    history:{
        type:Array,
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') }}
})

const walletModel = mongoose.model('wallet', walletSchema);

module.exports = {
    walletModel
}