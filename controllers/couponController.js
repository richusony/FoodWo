const { couponModel } = require('../models/couponSchema')
const productModel = require('../models/productSchema')

// Helper function to format date in DD/MM/YYYY
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

async function viewCouponMangemenPage(req, res) {
    const foodItem = await productModel.find({}).sort({ productName: 1 })
    const coupons = await couponModel.find({})
    // Format startDate and endDate to DD/MM/YYYY format
    const formattedCoupons = coupons.map(coupon => {
        return {
            ...coupon._doc,
            startDate: coupon.startDate.toLocaleDateString('en-GB'),
            endDate: coupon.endDate.toLocaleDateString('en-GB'),
        };
    });
    res.render('../views/Admin/couponMain.ejs', { food: foodItem , coupons:formattedCoupons});
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

async function deleteCoupon(req,res){
    const coupId = req.params.id;
    const deleteCoup = await couponModel.deleteOne({_id:coupId})
    if(deleteCoup){
        res.status(200).json({deleted:true});
    }else{
        res.status(500).json({deleted:false})
    }
}

async function viewCouponUpdatePage(req,res){
res.render('../views/Admin/couponUpdate.ejs')
}

module.exports = {
    viewCouponMangemenPage,
    createCoupon,
    deleteCoupon,
    viewCouponUpdatePage
}