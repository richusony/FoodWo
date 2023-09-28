const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    foodId:{
        type:String,
        required:true,
    },
    review:{
        type:String,
        required:true,
    }
})

const reviewModel = mongoose.model('review',reviewSchema);

module.exports= reviewModel;