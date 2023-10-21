const { couponModel } = require('../models/couponSchema')
const productModel = require('../models/productSchema');
const { userModel } = require('../models/userSchema');

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
    res.render('../views/Admin/couponMain.ejs', { food: foodItem, coupons: formattedCoupons });
}

async function createCoupon(req, res) {
    const { userLimit, usageLimit, startTime, endTime, couponCode, foodItem, discountType, discountValue } = req.body;
    const addCoupon = await couponModel.create({ usersLimit: userLimit, usageLimit: usageLimit, startDate: startTime, endDate: endTime, couponCode: couponCode, foodId: foodItem, discountType: discountType, discountValue: discountValue, status: "active" });
    if (addCoupon) {
        res.status(200).json({ added: true })
    } else {
        res.status(500).json({ added: false })
    }
}

async function deleteCoupon(req, res) {
    const coupId = req.params.id;
    const deleteCoup = await couponModel.deleteOne({ _id: coupId })
    if (deleteCoup) {
        res.redirect('/admin/coupons')
    } else {
        res.redirect('/admin/coupons')
    }
}

async function viewCouponUpdatePage(req, res) {
    const coupId = req.params.id;
    const coupon = await couponModel.find({ _id: coupId })
    const foodItem = await productModel.find({})
    const formattedCoupons = coupon.map(coupon => {
        return {
            ...coupon._doc,
            startDate: coupon.startDate.toISOString().split('T')[0],
            endDate: coupon.endDate.toISOString().split('T')[0],
        };
    });
    res.render('../views/Admin/couponUpdate.ejs', { coupon: formattedCoupons, food: foodItem })
}

async function updateCoupon(req, res) {
    const coupId = req.params.id;
    const { userLimit, usageLimit, startTime, endTime, couponCode, foodItem, discountType, discountValue, status } = req.body;

    const updating = await couponModel.updateOne({ _id: coupId }, { usersLimit: userLimit, usageLimit: usageLimit, startDate: startTime, endDate: endTime, couponCode: couponCode, foodId: foodItem, discountType: discountType, discountValue: discountValue, status: status })
    if (updating) {
        res.status(200).json({ updated: true })
    } else {
        res.status(500).json({ updated: false })
    }
}

async function checkingCoupon(req, res) {
    const userId = req.params.uid;
    const coupon = req.body.coupon;
    const exists = await couponModel.findOne({ couponCode: coupon })
    if (exists) {
        if (exists.status === "deactive") {
            res.status(500).json({ err: "This coupon has been blocked" })
        } else {
            const userData = userModel.findOne({_id:userId})
 
            const startDate = exists.startDate
            const endDate = exists.endDate
            const usersLimit = exists.usersLimit
            const usageLimit = exists.usageLimit

            const usedOrNot = userData.usedCoupons.map((coup)=>{
                if(coup.couponId===exists._id){
                    return coup; 
                }
            })
            res.status(200);
        }

    } else {
        res.status(404).json({ err: "Coupon not found" })
    }
    
}

module.exports = {
    viewCouponMangemenPage,
    createCoupon,
    deleteCoupon,
    viewCouponUpdatePage,
    updateCoupon,
    checkingCoupon
}