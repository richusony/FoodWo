const adminModel = require('../models/adminSchema');
const categoryModel = require('../models/categorySchema');
const productModel = require('../models/productSchema');
const { userModel } = require('../models/userSchema')



function viewDashboard(req, res) {
    res.render('../views/Admin/adminDashboard')
}

function viewLogInPage(req, res) {
    res.render('../views/Admin/adminLogin')
}

function viewOrdersPage(req, res) {
    res.render('../views/Admin/ordersMain');
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
    res.render('../views/Admin/adminAddProuduct', { data: categories })
}

async function addProduct(req, res) {
    const { productName, description, productPrice, productType, category, sold, inStock, baseImage } = req.body;
    const addingProduct = await productModel.create(
        {
            productName: productName,
            description: description,
            productPrice: productPrice,
            productType: productType,
            category: category,
            productSold: 0,
            productInStock: inStock,
            productImage: baseImage,
            purchaseCount: 0,
        });
    console.log('addingProduct :: ', addingProduct)
    res.status(200).json({ ok: "okkkkk" })
}

async function viewProductUpdatePage(req, res) {
    const id = req.params.id;
    const categories = await categoryModel.find({}).sort({ category: 1 })
    const productDetails = await productModel.find({ _id: id })
    res.render('../views/Admin/productUpdate', { data: productDetails, category: categories });
}

// Admin updates products
async function updateProducts(req, res) {
    const { id, productName, description, productPrice, productType, category, sold, inStock, image } = req.body;
    const updating = await productModel.updateOne({ _id: id }, { productName: productName, description: description, productPrice: productPrice, productType: productType, category: category, productInStock: inStock, productImage: image });
    if (updating) {
        const updatedDetails = await productModel.find({ _id: id });
        res.status(200).json({ data: updatedDetails })
    } else {
        res.status(500).json({ err: "Database is having some issues." })
    }
}

async function deleteProduct(req, res) {
    const id = req.params.id;
    const deleting = await productModel.deleteOne({ _id: id });
    if (deleting) {
        res.redirect('/admin/products')
    } else {
        res.status(500).json({ err: "Database having some issues.." })
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
    if (category) {
        const exist = await categoryModel.findOne({ category })
        if (exist) {
            res.status(401).json({ err: 'Category already existed.' })
        } else {
            const adding = await categoryModel.create({ category: category });
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
    console.log("got it :: ", id, category);
    const updating = await categoryModel.updateOne({ _id: id }, { category: category });

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

} 