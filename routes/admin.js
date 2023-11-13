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
    listAllTypes,
    viewAddTypePage,
    addType,
    updateType,
    deleteType,
    viewUpdateType,
    removeImage,
    updateOrderStatus,
} = require('../controllers/admin');
const router = express.Router();
const { adminAuth } = require('../middleware/sessionAuth')
const {productUpload} = require('../middleware/multer')
const {viewCouponMangemenPage,createCoupon, deleteCoupon, viewCouponUpdatePage, updateCoupon, checkingCoupon, getPrice}= require('../controllers/couponController');
const { salesToExcel, salesToPdf, viewSalePage } = require('../controllers/reportController');

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
    .post(productUpload.array("images"),addProduct)

// Admin views updateProduct page
router.route('/productUpdateDetails/:id')
    .get(viewProductUpdatePage)

// Admin update products
router.route('/update-product')
    .post(productUpload.array("images"),updateProducts)

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

router.route('/types')
.get(listAllTypes)

router.route('/addtype')
.get(viewAddTypePage)
.post(addType)

router.route('/update-type/:id')
.get(viewUpdateType)
.patch(updateType)

router.route('/delete-type/:id')
.get(deleteType);

router.route('/remove-image')
.patch(removeImage)

router.route('/update-order-status/:oid')
.patch(updateOrderStatus)

router.route('/coupons')
.get(viewCouponMangemenPage)

router.route('/create-coupon')
.post(createCoupon)

router.route('/delete-coupon/:id')
.get(deleteCoupon)

router.route('/coupon-update/:id')
.get(viewCouponUpdatePage)
.patch(updateCoupon)

router.route('/food-price/:fid')
.get(getPrice)

router.route('/sales')
.get(viewSalePage)

router.route('/sales-to-pdf')
.get(salesToPdf)

router.route('/sales-to-excel')
.get(salesToExcel)


module.exports = router;