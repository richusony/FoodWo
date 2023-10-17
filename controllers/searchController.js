const categoryModel = require('../models/categorySchema');
const productModel = require('../models/productSchema');
const { userModel } = require('../models/userSchema')


async function viewProductSearchPage(req,res){
    res.render('productSearch.ejs')
}   

async function searchFoodItems(req,res){
    const searchQuery = req.query.query;
    const products = await productModel.find({ productName: { $regex: searchQuery, $options: 'i' } });
    if(products){
        res.status(200).json({searchedItems:products})
    }else{
        res.status(404).json({err:'food doesnot exists'})
    }
}

module.exports={
    viewProductSearchPage,
    searchFoodItems
}