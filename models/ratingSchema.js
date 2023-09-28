const mongoose = require('mongoose');

const ratingSchema =new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    foodId:{
        type:String,
        required:true,
    },
    starCount:{
        type:Number,
        required:true,
    }
})

const ratingModel = mongoose.model('rating',ratingSchema);

module.exports=ratingModel;