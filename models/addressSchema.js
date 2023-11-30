const mongoose = require('mongoose');
const moment = require('moment');

const addressComponentsSchema = {
    country: {
        type: String,
        default: 'India',
        enum: ['India']
    },
    state: {
        type: String,
        required: true,
        enum: ['Kerala']
    },
    district: {
        type: String,
        required: true,
        enum: ['Kannur']
    },
    city: {
        type: String,
        required: true,
    },
    houseName: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    label: {
        type: String
    }
};

const addressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    address1: {
        type: addressComponentsSchema,
        required: true // Address1 is required
    },
    address2: {
        type: addressComponentsSchema // Address2 is optional
    },
    address3: {
        type: addressComponentsSchema // Address3 is optional
    }
});

const addressModel = mongoose.model('address', addressSchema);

module.exports = {
    addressModel
};
