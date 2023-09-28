const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    foodId:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    }
})

const cartModel = mongoose.model('cart',cartSchema);

module.exports=cartModel;
