const {couponModel} = require('../models/couponSchema')

async function viewCouponMangemenPage(req,res){
    res.render('../views/Admin/couponMain.ejs');
}

module.exports={
    viewCouponMangemenPage
}