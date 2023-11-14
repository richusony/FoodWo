const mongoose = require('mongoose');
const moment = require('moment');

const referalSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true,
        unique:true
    },
    referalCode:{
        type:String,
        required:true
    },
    usedUsers:{
        type:Array
    },
    
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') }}
},{
    timestamps:true
})

const referModel = mongoose.model('referal',referalSchema);

module.exports={
    referModel
}