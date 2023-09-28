const mongoose = require('mongoose');

async function connectMongo (uri){
    return mongoose.connect(uri);
}


module.exports={connectMongo,}