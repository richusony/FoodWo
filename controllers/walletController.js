const { walletModel } = require('../models/walletSchema');
const { userModel } = require('../models/userSchema');
const moment = require('moment');

async function viewWalletPage(req, res) {
    const userId = req.session.user._id;
    const user = await walletModel.findOne({userId:userId}).sort({created_at:-1})
    res.render('../views/userWallet.ejs',{data:user})
}


async function addMoney(req, res) {
    const userId = req.params.uid;
    const addedAmt = req.body.amount;
    const currentDate = moment().format('DD-MM-YYYY'); // Get the current date in 'DD-MM-YYYY' format

    const exists = await walletModel.findOne({ userId: userId });

    const historyData = {
        date: currentDate,
        amt: addedAmt,
        update:"inc"
    };

    if (exists) {
        const updateResult = await walletModel.updateOne(
            { userId: userId },
            {
                $inc: { balance: addedAmt },
                $push: { history: historyData }
            }
        );

        if (updateResult) {
            res.status(200).json({ added: true });
        } else {
            res.status(500).json({ added: false });
        }
    } else {
        const createResult = await walletModel.create({
            userId: userId,
            balance: addedAmt,
            history: [historyData] // Create an array with the initial transaction
        });

        if (createResult) {
            res.status(200).json({ added: true });
        } else {
            res.status(500).json({ added: false });
        }
    }
}


module.exports = {
    viewWalletPage,
    addMoney
}