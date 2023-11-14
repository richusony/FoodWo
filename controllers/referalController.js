const { userModel } = require('../models/userSchema');
const { referModel } = require('../models/referalSchema');

async function generateUniqueReferalCode() {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000); // Generates a random 5-digit number
    return `REFERQR${randomSuffix}`;
}

async function viewReferalPage(req, res) {
    const userId = req.params.uid;
    let referCode;

    const existReferCode = await referModel.findOne({ userId: userId });

    if (existReferCode) {
        referCode = existReferCode.referalCode;
    } else {
        const newReferalCode = await generateUniqueReferalCode();
        const creating = await referModel.create({ userId: userId, referalCode: newReferalCode });
        referCode = newReferalCode;
    }

    const findUser = await userModel.findOne({ _id: userId });
    res.render('../views/userReferal.ejs', { referCode: referCode });
}

async function verifyReferal(req, res) {
    const code = req.query.code;
    console.log("code : ",code)
    const findCode = await referModel.findOne({ referalCode: code.trim() })
    if(findCode){
        console.log("findCode : ",findCode)
        res.status(200).json({sucess:true})
    }else{
        console.log("findCode : ",findCode)
        res.status(400).json({failed:"code not found"})
    }
}

module.exports = {
    viewReferalPage,
    verifyReferal
};
