const express = require('express');
const { viewLogInPage,
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
} = require('../controllers/admin');
const router = express.Router();
const { adminAuth } = require('../middleware/sessionAuth')
const {productUpload} = require('../middleware/multer')

// Admin Login Get Request
router.route('/login')
    .get(viewLogInPage)
    .post(adminLogin)

// Admin Session Middleware
router.use(adminAuth)

// Admin Dashboard Get Request
router.route('/')
    .get(viewDashboard)

// Admin logout
router.route('/logout')
    .get(adminLogout)

// Admin Orders Page
router.route('/orders')
    .get(viewOrdersPage)

// Admin User's List Page
router.route('/users')
    .get(viewUsersListPage)

// Admin User Update
router.route('/userUpdateDetails/:id')
    .get(userDetails)

router.route('/update-user')
    .patch(userUpdate)

// Admin User Blocks
router.route('/user-block/:id/:blocked')
    .get(userBlocking)

// Admin Deletes User
router.route('/user-delete/:id')
    .get(userDelete)

// Admin view Products Page
router.route('/products')
    .get(viewProductsPage)

// Admin view AddProducts Page
router.route('/addProducts')
    .get(viewAddProductsPage)

// Admin adds Products
router.route('/addproduct')
    .post(productUpload.fields([{name:'mainimage',maxCount:5},{name:'relatedimages',maxCount:10}]),addProduct)

// Admin views updateProduct page
router.route('/productUpdateDetails/:id')
    .get(viewProductUpdatePage)

// Admin update products
router.route('/update-product')
    .patch(updateProducts)

// Admin deletes products
router.route('/product-delete/:id')
    .get(deleteProduct)

// Admin views Category Page
router.route('/category')
    .get(viewCategoryPage)

// Admin views Add Category Page
router.route('/addCategory')
    .get(viewAddCategoryPage)
    .post(addCategory)

// Admin updates the Category
router.route('/update-category/:id')
.get(viewUpdateCategory)
.patch(updateCategory)

// Admin delete Category
router.route('/category-delete/:id')
.get(deleteCategory)


module.exports = router;