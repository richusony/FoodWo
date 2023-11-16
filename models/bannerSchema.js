const mongoose = require('mongoose');
const moment = require('moment');

const bannerSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },

}, {
    timestamps: true
})

const bannerModel = mongoose.model("banners", bannerSchema);

module.exports = {
    bannerModel
}