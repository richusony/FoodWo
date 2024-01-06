const {userModel} = require('../models/userSchema');

async function viewEditProfilePage(req,res) {
    res.render('../views/editProfile.ejs');
}

module.exports = {
    viewEditProfilePage,
}