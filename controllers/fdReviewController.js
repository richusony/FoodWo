const { userModel } = require("../models/userSchema");
const { fdReviewModel } = require("../models/fdReviewSchema");
const productModel = require("../models/productSchema");

async function addReview(req, res) {
    console.log("reached")
    if(!req.session.user){
        res.status(401).json({falied:"user is not logged in"});
        return;
    }

    const userId = req.session.user._id;
    const { foodId, starCount, reviewText } = req.body;
    if (reviewText == "" || reviewText == undefined || reviewText == null) {
        return res.status(404).json("Review is empty");
    } else {
        const adding = await fdReviewModel.create({ userId: userId, foodId: foodId, starCount: starCount, review: reviewText.trim() });
        if(adding){
            res.status(200).json({success:"Review has been added"})
        }else{
            res.status(404).json({failed:"Server has some issues"})
        }
    }
}

module.exports = {
    addReview
}