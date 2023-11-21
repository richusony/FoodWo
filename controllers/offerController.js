const { categoryOfferModel, productOfferModel } = require("../models/offerSchema");
const productModel = require("../models/productSchema");
const categoryModel = require("../models/categorySchema");

async function viewOfferMainPage(req, res) {
    try {
        // Fetch product offers with only product IDs
        const productOffers = await productOfferModel.find({}).sort({ createdAt: -1 });
        const categoryOffers = await categoryOfferModel.find({}).sort({ createdAt: -1 });

        // Retrieve product names for product offers
        const productOfferDetails = await Promise.all(productOffers.map(async (offer) => {
            const product = await productModel.findById(offer.foodId);
            return {
                ...offer.toObject(),
                productName: product ? product.productName : 'Product Not Found' // Handle if product is not found
            };
        }));

        // Retrieve product names for product offers
        const categoryOfferDetails = await Promise.all(categoryOffers.map(async (offer) => {
            const category = await categoryModel.findById(offer.catId);
            return {
                ...offer.toObject(),
                categoryName: category ? category.category : 'Category Not Found' // Handle if category is not found
            };
        }));

        console.log(productOfferDetails, categoryOfferDetails)

        // Now, productOfferDetails contains product offers with productName added

        res.render("../views/Admin/offersMain.ejs", { productOff: productOfferDetails, categoryOff: categoryOfferDetails });
    } catch (error) {
        // Handle errors 
        res.status(500).send("Internal Server Error");
    }
}

async function viewCreateOfferPage(req, res) {
    const products = await productModel.find({})
    const categories = await categoryModel.find({})
    res.render("../views/Admin/newOffer.ejs", { food: products, category: categories });
}

async function createProductOffer(req, res) {
    const offerImage = req.file;
    const { food, description, discountType, discountValue, productExpiry } = req.body;
    console.log(offerImage, food, description, discountType, discountValue, productExpiry);

    const creatingProductOffer = await productOfferModel.create({ foodId: food, description: description, discountType: discountType, discountValue: discountValue, offerImage: offerImage.path, expiry: productExpiry });

    if (creatingProductOffer) {
        res.status(200).json({ success: "Product Offer Created" })
    } else {
        res.status(400).json({ failed: "Error While Creating Product Offer" })
    }
}

async function createCategoryOffer(req, res) {
    const offerImage = req.file;
    const { category, description, discountType, discountValue, categoryExpiry } = req.body;
    console.log(offerImage, category, description, discountType, discountValue, categoryExpiry);

    const creatingProductOffer = await categoryOfferModel.create({ catId: category, description: description, discountType: discountType, discountValue: discountValue, offerImage: offerImage.path, expiry: categoryExpiry });

    if (creatingProductOffer) {
        res.status(200).json({ success: "Category Offer Created" })
    } else {
        res.status(400).json({ failed: "Error While Creating Category Offer" })
    }
}

async function viewUserOfferPage(req, res) {
    try {
        // Fetch product offers with only product IDs
        const productOffers = await productOfferModel.find({}).sort({ createdAt: -1 });
        const categoryOffers = await categoryOfferModel.find({}).sort({ createdAt: -1 });

        // Retrieve product names for product offers
        const productOfferDetails = await Promise.all(productOffers.map(async (offer) => {
            const product = await productModel.findById(offer.foodId);
            return {
                ...offer.toObject(),
                productName: product ? product.productName : 'Product Not Found' // Handle if product is not found
            };
        }));

        // Retrieve product names for product offers
        const categoryOfferDetails = await Promise.all(categoryOffers.map(async (offer) => {
            const category = await categoryModel.findById(offer.catId);
            return {
                ...offer.toObject(),
                categoryName: category ? category.category : 'Category Not Found' // Handle if category is not found
            };
        }));

        console.log(productOfferDetails, categoryOfferDetails)

        // Now, productOfferDetails contains product offers with productName added

        res.render("../views/offers.ejs", { productOff: productOfferDetails, categoryOff: categoryOfferDetails });
    } catch (error) {
        // Handle errors 
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    viewOfferMainPage,
    viewCreateOfferPage,
    viewUserOfferPage,
    createProductOffer,
    createCategoryOffer
}