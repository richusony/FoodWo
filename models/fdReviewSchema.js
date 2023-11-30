const mongoose = require('mongoose');
const moment = require('moment');

const fdReviewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    foodId: {
        type: String,
        requierd: true
    },
    starCount:{
        type:Number
    },
    review: {
        type: String,
        required: true
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') } }
}, {
    timestamps: true
})

const fdReviewModel = mongoose.model('foodReview',fdReviewSchema);

module.exports={
    fdReviewModel
}