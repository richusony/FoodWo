const { categoryOfferModel, productOfferModel } = require("../models/offerSchema");
const productModel = require("../models/productSchema");

async function viewOfferMainPage(req,res){
    res.render("../views/Admin/offersMain.ejs");
}

async function viewCreateOfferPage(req,res){
    const products = await productModel.find({})
    res.render("../views/Admin/newOffer.ejs",{food:products});
}

module.exports={
    viewOfferMainPage,
    viewCreateOfferPage
}