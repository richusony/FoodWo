const mongoose = require('mongoose');
const moment = require('moment');

const typeSchema = new mongoose.Schema({
    productType: {
        type: String,
        required: true
    },
    created_at: { type: String, default: () => { return moment(new Date()).format('DD/MM/YYYY') } }
}) 

const typeModel = mongoose.model('pdt_type',typeSchema);

module.exports=typeModel;