const mongoose = require('mongoose')
const moment = require('moment')

const wishListSchema = new mongoose.Schema({
    foodId:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') }}
},{
    timestamps:true
})

const wishListModel = mongoose.model('wishlist',wishListSchema);

module.exports=wishListModel;