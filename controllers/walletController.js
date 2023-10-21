const { walletModel } = require('../models/walletSchema');
const { userModel } = require('../models/userSchema');

async function viewWalletPage(req, res) {
    const userId = req.params.uid;
    const user = await walletModel.findOne({userId:userId})
    res.render('../views/userWallet.ejs',{data:user})
}

async function addMoney(req, res) {
    const userId = req.params.uid;
    const addedAmt = req.body.amount;
    console.log('reached ',addedAmt,userId)
    const exists = await walletModel.findOne({userId:userId});

    if(exists){
        const adding = await walletModel.updateOne({ userId: userId }, { $inc: { balance: addedAmt } })
        if(adding){
            res.status(200).json({added:true})
        }else{
            res.status(500).json({added:false})
        }
    }else{
        const adding = await walletModel.create({ userId: userId ,balance: addedAmt})
        if(adding){
            res.status(200).json({added:true})
        }else{
            res.status(500).json({added:false})
        }
    }
}

module.exports = {
    viewWalletPage,
    addMoney
}