const productModel = require('../models/productSchema');
const wishListModel = require('../models/wishlistSchema');


async function viewWishlistPage(req, res) {
    const userId = req.params.uid;
    const wishes = await wishListModel.aggregate([
        {
            $match: { userId: userId }
        },
        {
            $project: {
                foodId: 1,
            }
        }
    ])
    const wishIds = wishes.map(item => item.foodId)
    const wishData = await productModel.find({ _id: { $in: wishIds } }).sort({createdAt:-1});
    res.render('../views/userWishlist.ejs', { wishes: wishData })
}

async function removeWishlist(req, res) {
    console.log('got : ', req.body)
    const { userId, foodid } = req.body;
    const removing = await wishListModel.deleteOne({ foodId: foodid, userId: userId })
    console.log(removing)
    if (removing) {
        res.status(200).json({ deleted: true })
    } else {
        res.status(500).json({ deleted: false })
    }
}


module.exports = {
    viewWishlistPage,
    removeWishlist
}