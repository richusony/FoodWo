const { userModel } = require('../models/userSchema');
const { referModel } = require('../models/referalSchema');

async function generateUniqueReferalCode() {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000); // Generates a random 5-digit number
    return `REFERQR${randomSuffix}`;
}

async function viewReferalPage(req, res) {
    try {
        const userId = req.session.user._id;
        let referCode;

        const user = await userModel.findOne({ _id: userId });

        if (!user) {
            return res.render("../views/pageNotFound.ejs")
        }

        const existReferCode = await referModel.findOne({ userId: userId });

        if (existReferCode) {
            referCode = existReferCode.referalCode;
        } else {
            const newReferalCode = await generateUniqueReferalCode(userId);
            await referModel.create({ userId: userId, referalCode: newReferalCode });
            referCode = newReferalCode;
        }

        res.render('../views/userReferal.ejs', { referCode: referCode });
    } catch (err) {
        console.error('Error fetching referral details:', err);
        res.render("../views/pageNotFound.ejs");
    }
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