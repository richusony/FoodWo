const mongoose = require('mongoose');
const moment = require('moment');

const productOfferSchema = new mongoose.Schema({
    foodId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        required: true
    },
    discountValue: {
        type: String,
        required: true
    },
    offerImage: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') } }
}, {
    timestamps: true
});



const categoryOfferSchema = new mongoose.Schema({
    catId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        required: true
    },
    discountValue: {
        type: String,
        required: true
    },
    offerImage: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') } }
}, {
    timestamps: true
});

const productOfferModel = mongoose.model('productOffer', productOfferSchema);
const categoryOfferModel = mongoose.model('categoryOffer', categoryOfferSchema);

module.exports = {
    productOfferModel,
    categoryOfferModel
}