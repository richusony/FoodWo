const mongoose = require('mongoose');

async function connectMongo(uri) {
    return await mongoose.connect(uri).catch((error) => {
        console.log("database is not connected");
    })
}


module.exports = { connectMongo, } 