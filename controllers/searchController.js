const categoryModel = require('../models/categorySchema');
const productModel = require('../models/productSchema');
const { recentSearchModel } = require('../models/recentSearchSchema');
const { userModel } = require('../models/userSchema');

async function viewProductSearchPage(req, res) {
    res.render('../views/productSearch.ejs');
}

async function searchFoodItems(req, res) {
    const searchQuery = req.query.query;
    const sortfood = req.query.sortfood;

    try {
        let products;
        if (sortfood === 'fresh') {
            products = await productModel.find({
                $or: [
                    { productName: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                    { category: { $regex: searchQuery, $options: 'i' } }
                ]
            }).sort({ createdAt: -1 });
        } else if (sortfood === 'priceAsc') {
            products = await productModel.find({
                $or: [
                    { productName: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                    { category: { $regex: searchQuery, $options: 'i' } }
                ]
            }).sort({ productPrice: 1 });
        } else if (sortfood === 'priceDes') {
            products = await productModel.find({
                $or: [
                    { productName: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                    { category: { $regex: searchQuery, $options: 'i' } }
                ]
            }).sort({ productPrice: -1 });
        } else {
            products = await productModel.find({
                $or: [
                    { productName: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                    { category: { $regex: searchQuery, $options: 'i' } }
                ]
            });
        }

        if (products.length > 0) {
            res.status(200).json({ searchedItems: products });
        } else {
            res.status(404).json({ err: 'food does not exist' });
        }

        // Add the search query to recent searches
        if(req.session.user){
            await recentSearchModel.addRecentSearch(req.session.user._id, searchQuery);
        }

    } catch (error) {
        console.error('Error searching for food items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function recentSearches(req, res) {
    if (req.session.user) {
        try {
            const recentSearch = await recentSearchModel.findOne({ userId: req.session.user._id });
            
            if (recentSearch) {
                res.status(200).json({ recent: recentSearch });
            } else {
                res.status(400).json({ recent: null });
            }
        } catch (error) {
            console.error('Error fetching recent searches:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(404).json({ err: 'User is not logged in' });
    }
}


module.exports = {
    viewProductSearchPage,
    searchFoodItems,
    recentSearches
};
