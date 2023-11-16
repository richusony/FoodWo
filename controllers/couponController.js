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
    const exists = await couponModel.findOne({couponCode:couponCode});
    if(exists){
        res.status(400).json({err:'coupon already existed'});
        return;
    }
    const food = await productModel.findOne({_id:foodItem})
    const addCoupon = await couponModel.create({ usersLimit: userLimit, usageLimit: usageLimit, startDate: startTime, endDate: endTime, couponCode: couponCode, foodId: foodItem,foodName:food.productName, discountType: discountType, discountValue: discountValue, status: "active",usedUsersCount:0 });
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
        res.status(200).json({deleted:true})
    } else {
        res.status(400).json({deleted:false})
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
    const foodids = req.body.foodids.split(",");
    console.log("foodids : ", foodids)
    const exists = await couponModel.findOne({ couponCode: coupon })
    const checkFood = foodids.includes(exists?.foodId)
    console.log("food checking : ", checkFood)
    if (exists) {
        if(exists.usedUsersCount>=exists.usageLimit){
            res.status(400).json({err:"you are late. maximum user limit has been reached"})
            return;
        }
        if (checkFood) {
            if (exists.status === "deactive") {
                res.status(500).json({ err: "This coupon has been blocked" })
            } else {
                const userData = await userModel.findOne({ _id: userId })
                console.log('user : ', userData)

                const startDate = exists.startDate
                const endDate = exists.endDate
                const usersLimit = exists.usersLimit
                const usageLimit = exists.usageLimit
                const discountType = exists.discountType
                const discountValue = exists.discountValue

                const usedOrNot = userData.usedCoupons.length == 0 ? false : userData?.usedCoupons.filter((coup) => coup && coup.couponId == exists._id.toString());
                console.log('coupon : ', usedOrNot)

                if (usedOrNot == false || usedOrNot[0] == false) {
                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);
                    console.log(startDate, endDate)
                    if (endDate < currentDate) {
                        res.status(400).json({ err: "coupon expired" })
                    } else {
                        // const updateData = {
                        //     couponId: exists._id.toString(),
                        //     usedCount: 1
                        // }
                        // console.log("usedCoupons before update: ", userModel.usedCoupons);
                        // const updatingUser = await userModel.updateOne({ _id: userId }, { $push: { usedCoupons: updateData } })
                        // if (updatingUser) {
                        //     const updateCoupon = await couponModel.updateOne({_id:exists._id.toString()},{$inc:{usedUsersCount:1}})
                        //     console.log(updateCoupon)
                            res.status(200).json({ added: true, sucess: "coupon added", discountType: discountType, discountValue: discountValue })

                        //     console.log("usedCoupons after update: ", userModel.usedCoupons);
                        // } else {
                        //     res.status(500).json({ added: false, err: "Database is having some issues" })
                        // }
                    }
                } else {
                    const findCoupon = usedOrNot.filter((coup) => coup && coup.couponId == exists._id.toString());
                    console.log('findcoupon', findCoupon)
                    const usedCount = parseInt(findCoupon[0].usedCount);
                    if (usedCount >= usageLimit) {
                        res.status(400).json({ added: false, err: "Coupon usage limit has been reached." })
                        return;
                    } else {
                        // const updating = await userModel.updateOne({ _id: userId, 'usedCoupons.couponId': findCoupon[0].couponId },
                        //     { $inc: { 'usedCoupons.$.usedCount': 1 } })
                        // if (updating) {
                            res.status(200).json({ added: true, sucess: "coupon added", discountType: discountType, discountValue: discountValue })
                        // } else {
                        //     res.status(500).json({ added: false, err: "Database is having some issues" })
                        // }
                    }
                }


            }

        } else {
            res.status(400).json({ err: "The offer is not for this product" })
        }

    } else {
        res.status(404).json({ err: "Coupon not found" })
    }

}

async function getPrice(req,res){
 const fid = req.params.fid;
 const food = await productModel.findOne({_id:fid});
 if(food){
    res.status(200).json({foodData:food})
 }else{
    res.status(400).json({err:"food dosen't exists."})
 }
}

module.exports = {
    viewCouponMangemenPage,
    createCoupon,
    deleteCoupon,
    viewCouponUpdatePage,
    updateCoupon,
    checkingCoupon,
    getPrice
}