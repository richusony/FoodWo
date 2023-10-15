const mongoose = require('mongoose');
const moment = require('moment');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    address1: {
        type:String,
        required: true
    },
    address2: {
        type:String,
    },
    address3: {
        type:String,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    blocked: {
        type: Boolean,
        required: true
    },
    purchaseCount: {
        type: Number,
        required: true
    },
    created_at: {
        type: String,
        default: () => {
            return moment(new Date()).format('DD/MM/YYYY')
        }
    }
});

const userModel = mongoose.model('User', userSchema);

module.exports = {
    userModel,
}
