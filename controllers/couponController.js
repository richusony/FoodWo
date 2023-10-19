const {couponModel} = require('../models/couponSchema')
const productModel = require('../models/productSchema')

async function viewCouponMangemenPage(req,res){
    const foodItem = await productModel.find({}).sort({productName:1})
    res.render('../views/Admin/couponMain.ejs',{food:foodItem});
}

module.exports={
    viewCouponMangemenPage
}