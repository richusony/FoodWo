const {walletModel} = require('../models/walletSchema');
const {userModel}=require('../models/userSchema');

async function viewWalletPage(req,res){
    res.render('../views/userWallet.ejs')
}

module.exports={
    viewWalletPage
}