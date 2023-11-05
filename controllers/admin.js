const adminModel = require('../models/adminSchema');
const categoryModel = require('../models/categorySchema');
const productModel = require('../models/productSchema');
const { userModel } = require('../models/userSchema')
const typeModel = require('../models/productTypeSchema')
const orderModel = require('../models/orderSchema')



async function viewDashboard(req, res) {
    const topCustomers = await userModel.find({}).sort({ purchaseCount: -1 }).limit(3);
    const topProducts = await productModel.find({}).sort({ purchaseCount: -1 }).limit(3);
    res.render('../views/Admin/adminDashboard', { topCust: topCustomers, topProd: topProducts })
}

function viewLogInPage(req, res) {
    res.render('../views/Admin/adminLogin')
}

async function viewOrdersPage(req, res) {
    const allOrders = await orderModel.find({}).sort({ createdAt: -1 }).limit(8)
    res.render('../views/Admin/ordersMain', { orders: allOrders });
}

async function adminLogin(req, res) {
    const { email, password } = req.body;
    const adminExists = await adminModel.findOne({ email: email });
    if (adminExists) {
        if (password === adminExists.password) {
            req.session.admin = adminExists;
            res.status(201).json({ success: "Login Successfull" })
        }
        else {
            res.status(401).json({ err: "Wrong Password" })
        }
    }
    else {
        res.status(401).json({ err: "Admin doesn't exists" })
    }
}

function adminLogout(req, res) {
    //Destroying Session
    req.session.destroy();
    res.redirect('/admin')
}

async function viewUsersListPage(req, res) {
    const userData = await userModel.find({}).sort({ fullname: 1 });
    if (userData) {
        res.render('../views/Admin/usersMain', { data: userData })
    }
}

// Admin update user
async function userDetails(req, res) {
    const id = req.params.id;
    const userDetails = await userModel.find({ _id: id })
    if (userDetails) {
        res.render('../views/Admin/userUpdate', { data: userDetails });
    }
}
async function userUpdate(req, res) {
    const { fullname, email, phone, address, image } = req.body;
    console.log(fullname, email, phone, address);
    const user = await userModel.updateOne({ email: email }, { fullname: fullname, email: email, phone: phone, address: address, image: image })
    const updatedDetails = await userModel.find({ email: email })
    // console.log(updatedDetails);
    if (user) {
        res.render('../views/Admin/userUpdate', { data: updatedDetails })
    }
}

// Admin blocking users
async function userBlocking(req, res) {
    const id = req.params.id;
    const blocked = req.params.blocked == "false" ? false : true;

    const user = await userModel.updateOne({ _id: id }, { blocked: !blocked });
    const allUsers = await userModel.find({}).sort({ fullname: 1 });
    if (user) {
        res.render('../views/Admin/usersMain.ejs', { data: allUsers })
    }
}

// Admin Deletes user
async function userDelete(req, res) {
    const id = req.params.id;
    const user = await userModel.deleteOne({ _id: id });
    const allUsers = await userModel.find({}).sort({ fullname: 1 });
    if (user) {
        res.render('../views/Admin/usersMain.ejs', { data: allUsers })
    }
}

async function viewProductsPage(req, res) {
    const products = await productModel.aggregate(
        [
            {
                $sort: {
                    productName: 1
                }
            },
            {
                $project: {
                    productName: 1,
                    description: 1,
                    productPrice: 1,
                    productType: 1,
                    category: 1,
                    productSold: 1,
                    productInStock: 1,
                }
            }
        ])

    res.render('../views/Admin/productsMain', { data: products })
}

async function viewAddProductsPage(req, res) {
    const categories = await categoryModel.find({}).sort({ category: 1 })
    const types = await typeModel.find({}).sort({ productType: 1 })
    res.render('../views/Admin/adminAddProuduct', { data: categories, types: types }) 
}

async function addProduct(req, res) {
    const { productName, description, productPrice, productType, category, sold, inStock, baseImage } = req.body;
    console.log(req.body)
    if(productPrice <=0){
        res.status(400).json({err:"Product Price must be greater than zero."})
        return ;
    }
    if(inStock <=0){
        res.status(400).json({err:"Stock must be greater than zero."})
        return ;
    }
    // const relatedImages = req.files.relatedimages.map(img => img.path);
    const images = req.files.map(img => img.path);
    // console.log('mainImage : ', mainImage)
    console.log('files : ', req.files)
    res.status(200)
    const addingProduct = await productModel.create(
        {
            productName: productName,
            description: description,
            productPrice: productPrice,
            productType: productType,
            category: category.trim(),
            productSold: 0,
            productInStock: inStock,
            productMainImage: "aldkfadf",
            productRelatedImages: [],
            productImages:images,
            purchaseCount: 0,
        });
    console.log('addingProduct :: ', addingProduct)
    if(addingProduct){
    res.status(200).json({success:"Product Added."})
    }else{
    res.status(400).json({err:"Problem while adding products"})}
}

async function viewProductUpdatePage(req, res) {
    const id = req.params.id;
    const categories = await categoryModel.find({}).sort({ category: 1 })
    const productDetails = await productModel.find({ _id: id })
    const typeDetails = await typeModel.find({}).sort({ productType: 1 })
    res.render('../views/Admin/productUpdate', { data: productDetails, category: categories, types: typeDetails });
}

//  Admin updates products
async function updateProducts(req, res) {
    const { id, productName, description, productPrice, productType, category, sold, inStock } = req.body;
    const images = req.files? req.files.map(img => img.path) : [];
    // const relatedImages = req.files.relatedimages ? req.files.relatedimages.map(img => img.path) : [];
    console.log('checkkinng  .. ', images)

    if(productPrice <=0){ 
        res.status(400).json({err:"Product Price must be greater than zero."})
        return ;
    }
    if(inStock <=0){
        res.status(400).json({err:"Stock must be greater than zero."})
        return ;
    }

    if (images.length != 0) {
        const updating = await productModel.updateOne({ _id: id }, { productName: productName, description: description, productPrice: productPrice, productType: productType, category: category.trim(), productInStock: inStock ,productImages:images });
        if (updating) {
            const updatedDetails = await productModel.find({ _id: id });
            res.status(200).json({success:"Product updated"})
        } else {
            res.status(500).json({ err: "Database is having some issues." })
        }
    }else{
        res.status(400).json({err:"Product images is required"})
    }

}
 
async function deleteProduct(req, res) {
    const id = req.params.id;  
    const deleting = await productModel.deleteOne({ _id: id });
    if (deleting) {
        res.status(200).json({deleted:true}) 
    } else {
        res.status(500).json({deleted:false, err: "Database having some issues.." })
    }
}

// Admin views categories Page
async function viewCategoryPage(req, res) {
    const categories = await categoryModel.find({}).sort({ category: 1 })
    res.render('../views/Admin/adminCategory', { data: categories });
}

// Admin views add category Page
function viewAddCategoryPage(req, res) {
    res.render('../views/Admin/adminAddCategory');
}

// Admin Adding categories Page
async function addCategory(req, res) {
    const { category } = req.body;
    const upperCategory = category.toUpperCase();
    if (upperCategory) {
        const exist = await categoryModel.findOne({ category: upperCategory })
        if (exist) {
            res.status(401).json({ err: 'Category already existed.' })
        } else {
            const adding = await categoryModel.create({ category: upperCategory.trim() });
            if (adding) {
                res.status(200).json({ success: "category added to database" })
            } else {
                res.status(500).json({ err: "Database is having some issues." })
            }
        }
    } else {
        res.status(400).json({ err: "Enter Category Name." })
    }
}

async function viewUpdateCategory(req, res) {
    const id = req.params.id;
    const category = await categoryModel.findOne({ _id: id });
    if (category) {
        res.render('../views/Admin/categoryUpdate', { data: category })
    } else {
        res.status(500).json({ err: "Database is having some issues" })
    }
}

async function updateCategory(req, res) {
    const id = req.params.id;
    const { category } = req.body;
    const upperCategory = category.toUpperCase();
    const exist = await categoryModel.findOne({category:upperCategory});
    if(exist){
        if(exist._id === id){
            console.log("got it :: ", id, category);
            const updating = await categoryModel.updateOne({ _id: id }, { category: upperCategory.trim() });
        
            if (updating) {
                const updatedDetails = await categoryModel.find({ _id: id });
                if (updatedDetails) {
                    res.render('../views/Admin/categoryUpdate', { data: updatedDetails })
                }
                else {
                    res.status(500).json({ err: "Database is having some issues" })
                }
            } else {
                res.status(500).json({ err: "Database is having some issues" })
            }
        }else{
            res.status(401).json({ err: 'Category already existed.' })
        }
    }else{
        console.log("got it :: ", id, category);
        const updating = await categoryModel.updateOne({ _id: id }, { category: upperCategory.trim() });
    
        if (updating) {
            const updatedDetails = await categoryModel.find({ _id: id });
            if (updatedDetails) {
                res.render('../views/Admin/categoryUpdate', { data: updatedDetails })
            }
            else {
                res.status(500).json({ err: "Database is having some issues" })
            }
        } else {
            res.status(500).json({ err: "Database is having some issues" })
        }
    }
}


async function deleteCategory(req, res) {
    const id = req.params.id;
    const deleting = await categoryModel.deleteOne({ _id: id });
    if (deleting) {
        res.redirect('/admin/category')
    }
    else {
        res.status(500).json({ err: "Database is having some issues." })
    }
}

async function listAllTypes(req, res) {
    const types = await typeModel.find({}).sort({ productType: 1 });
    res.render('../views/Admin/adminType.ejs', { data: types })
}

async function viewAddTypePage(req, res) {
    res.render('../views/Admin/adminAddType.ejs')
}

async function addType(req, res) {
    const productType = req.body.type;
    if (productType) {
        const exist = await typeModel.findOne({ productType })
        if (exist) {
            res.status(401).json({ err: 'Type already existed.' })
        } else {
            const adding = await typeModel.create({ productType: productType });
            if (adding) {
                res.status(200).json({ success: "Type added to database" })
            } else {
                res.status(500).json({ err: "Database is having some issues." })
            }
        }
    } else {
        res.status(400).json({ err: "Enter product Type Name." })
    }
}

async function viewUpdateType(req, res) {
    const id = req.params.id;
    const typeData = await typeModel.findOne({ _id: id });
    res.render('../views/Admin/updateType.ejs', { data: typeData })
}

async function updateType(req, res) {
    const { productType, typeId } = req.body;

    const exist = await typeModel.findOne({ _id: typeId });
    if (!exist) {
        res.status(404).json({ err: "Product type doesn't exists." })
    } else {
        const updating = await typeModel.updateOne({ _id: typeId }, { productType: productType })
        res.status(200).json({ updated: true });
    }
}

async function deleteType(req, res) {
    const id = req.params.id;
    const exist = await typeModel.findOne({ _id: id });
    if (!exist) {
        res.status(404).json({ err: "Product type doesn't exists." })
    } else {
        const deleting = await typeModel.deleteOne({ _id: id });
        res.redirect('/admin/types')

    }
}

async function removeImage(req, res) { 
    const { foodid, foodimg } = req.body;
    const removeImage = await productModel.updateOne({ _id: foodid }, { $pull: { productImages: foodimg } })
    if (removeImage) {
        res.status(200).json({ success: 'image removed.' })
    } else {
        res.status(400).json({ err: "couldn't remove image." })
    }
}


async function updateOrderStatus(req,res){
    const orderId = req.params.oid;
    const orderStatus = req.body.status;

    if(orderId&&orderStatus){
        const updating = await orderModel.updateOne({orderId:orderId},{orderStatus:orderStatus})
        if(updating){
            res.status(200).json({updated:true})
        }
    }
}


module.exports = {
    viewLogInPage,
    viewOrdersPage,
    viewUsersListPage,
    userDetails,
    userUpdate,
    userBlocking,
    userDelete,
    viewDashboard,
    viewProductsPage,
    viewAddProductsPage,
    addProduct,
    viewProductUpdatePage,
    updateProducts,
    deleteProduct,
    adminLogin,
    adminLogout,
    viewCategoryPage,
    viewAddCategoryPage,
    addCategory,
    deleteCategory,
    viewUpdateCategory,
    updateCategory,
    listAllTypes,
    addType,
    viewAddTypePage,
    updateType,
    deleteType,
    viewUpdateType,
    removeImage,
    updateOrderStatus
} 