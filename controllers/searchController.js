const categoryModel = require('../models/categorySchema');
const productModel = require('../models/productSchema');
const { userModel } = require('../models/userSchema')


async function viewProductSearchPage(req,res){
    res.render('productSearch.ejs')
}

module.exports={
    viewProductSearchPage
}