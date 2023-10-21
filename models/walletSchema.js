const mongoose = require('mongoose');
const moment = require('moment');

const walletSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const walletModel = mongoose.model('wallet', walletSchema);

module.exports = {
    walletModel
}