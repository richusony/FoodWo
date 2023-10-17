const categoryModel = require('../models/categorySchema');
const productModel = require('../models/productSchema');
const { userModel } = require('../models/userSchema')


async function viewProductSearchPage(req,res){
    res.render('productSearch.ejs')
}   

async function searchFoodItems(req,res){ 
    const searchQuery = req.query.query;
    const sortfood = req.query.sortfood;
    if(sortfood=="fresh"){
        const products = await productModel.find({
            $or: [
                { productName: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { category: { $regex: searchQuery, $options: 'i' } }
            ]
        }).sort({createdAt:-1});
    
        if(products){
            res.status(200).json({searchedItems:products})
        }else{
            res.status(404).json({err:'food doesnot exists'})
        }
    }else if(sortfood=="priceAsc"){
        const products = await productModel.find({
            $or: [
                { productName: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { category: { $regex: searchQuery, $options: 'i' } }
            ]
        }).sort({productPrice:1});
    
        if(products){
            res.status(200).json({searchedItems:products})
        }else{
            res.status(404).json({err:'food doesnot exists'})
        }
    }else if(sortfood=="priceDes"){
        const products = await productModel.find({
            $or: [
                { productName: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { category: { $regex: searchQuery, $options: 'i' } }
            ]
        }).sort({productPrice:-1});
    
        if(products){
            res.status(200).json({searchedItems:products})
        }else{
            res.status(404).json({err:'food doesnot exists'})
        }
    }else{
        const products = await productModel.find({
            $or: [
                { productName: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { category: { $regex: searchQuery, $options: 'i' } }
            ]
        });
    
        if(products){
            res.status(200).json({searchedItems:products})
        }else{
            res.status(404).json({err:'food doesnot exists'})
        }
    }
    
}

module.exports={
    viewProductSearchPage,
    searchFoodItems
}