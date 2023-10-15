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
    address: {
        type: Array,
        validate: {
            validator: function (addresses) {
                // Define the maximum number of addresses allowed (e.g., 3)
                const maxAddresses = 3;
                return addresses.length <= maxAddresses;
            },
            message: 'You can only add up to 3 addresses.'
        },
        required: true
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
