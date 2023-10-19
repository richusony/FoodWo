const { couponModel } = require('../models/couponSchema')
const productModel = require('../models/productSchema')

async function viewCouponMangemenPage(req, res) {
    const foodItem = await productModel.find({}).sort({ productName: 1 })
    res.render('../views/Admin/couponMain.ejs', { food: foodItem });
}

async function createCoupon(req, res) {
    const { userLimit, usageLimit, startTime, endTime, couponCode, foodItem, discountType, discountValue } = req.body;
    const addCoupon = await couponModel.create({usersLimit:userLimit,usageLimit:usageLimit,startDate:startTime,endDate:endTime,couponCode:couponCode,foodId:foodItem,discountType:discountType,discountValue:discountValue});
    if(addCoupon){
        res.status(200).json({added:true})
    }else{
        res.status(500).json({added:false})
    }
}

module.exports = {
    viewCouponMangemenPage,
    createCoupon
}