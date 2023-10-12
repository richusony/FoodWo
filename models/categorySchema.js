const mongoose = require('mongoose');
const moment = require('moment');

const categorySchema = new mongoose.Schema({
    category:{
        type:String,
        required:true,
        uppercase:true
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') }}
})

const categoryModel = mongoose.model('category',categorySchema);

module.exports=categoryModel;