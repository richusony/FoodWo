const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/sessionAuth')
const { isBlocked } = require('../middleware/userBlocked')
const { upload, profileUpload } = require('../middleware/multer')
const { viewProductSearchPage, searchFoodItems, recentSearches } = require('../controllers/searchController')
const { viewWishlistPage, removeWishlist } = require('../controllers/wishlistController')
const { signInUser, addToWishlist, viewSignInPage, viewLoginInPage, loginUser, productPage, otppage, otpVerification, logoutUser, viewCartPage, removeFromWishlist, addToCart, removeFromCart, viewForgotPasswordPage, viewverifyPhonePage, sendResetUrl, updateNewPassword, viewUserProfile, updateUserProfile, updateStock, viewProductDetailsPage, viewMyOrderPage, viewOrderSuccessPage, viewOrderItemPage, cancelOrder, updateUserAddress, addNewAddress, checkingQuantity, deleteAccount, viewPageNotFound, userSession, getAllfoodItems, serverReactivation } = require('../controllers/user');
const { createOrders, verifyOrders } = require('../controllers/paymentController');
const { checkingCoupon } = require('../controllers/couponController');
const { viewWalletPage, addMoney } = require('../controllers/walletController');
const { viewInvoice } = require('../controllers/invoiceController');
const { viewReferalPage, verifyReferal } = require('../controllers/referalController');
const { viewUserOfferPage } = require('../controllers/offerController');
const { addReview } = require('../controllers/fdReviewController');
const { viewNewAddressPage, newAddress, deleteAddress, viewUpdateAddressPage, updateAddress } = require('../controllers/addressController');
const { viewEditProfilePage, updateUserDetails } = require('../controllers/userProfileController');


// User SignUp Get Request
router.route('/signup')
    .get(viewSignInPage)
    .post(signInUser);

// User Login Get Request
router.route('/login')
    .get(viewLoginInPage)
    .post(loginUser)

router.route('/food')
    .get(getAllfoodItems)

router.route('/search-products')
    .get(viewProductSearchPage)

router.route('/search-food')
    .get(searchFoodItems)

router.route('/user-session')
    .get(userSession)

// User Products Page Get Request
router.route('/products').get(productPage)

// User SignIn Post Request
router.post('/signin', signInUser)

//User otp verification
router.route('/otpVerify')
    .get(otppage)
    .post(otpVerification)

router.route('/verifyPhone')
    .get(viewverifyPhonePage)
    .post(sendResetUrl)

router.route('/forgotPassword/:id')
    .get(viewForgotPasswordPage)

router.route('/newpassword')
    .post(updateNewPassword)


router.route('/product-details/:id')
    .get(viewProductDetailsPage)

router.route('/verify-referal')
    .get(verifyReferal)

router.route('/review')
    .post(addReview)


// User Session Middleware
router.use(userAuth)

// Checking wether User is Blocked or Not
router.use(isBlocked)

router.route('/wishlist')
    .get(viewWishlistPage)

router.route('/userProfile')
    .get(viewUserProfile)
    .post(upload.single('image'), updateUserProfile)

router.route('/cart')
    .get(viewCartPage)

router.route('/addToCart')
    .post(addToCart)

router.route('/logout')
    .get(logoutUser)

router.route('/addWishlist/:fid/:uid')
    .post(addToWishlist)

router.route('/remove-wishlist')
    .delete(removeWishlist)

router.route('/check-qty')
    .post(checkingQuantity)

router.route('/removeFromCart/')
    .post(removeFromCart)

router.route('/cart-checkout')
    .post(updateStock)

router.route('/my-orders')
    .get(viewMyOrderPage)

router.route('/order-success')
    .get(viewOrderSuccessPage)

router.route('/order-details/:oid')
    .get(viewOrderItemPage)

router.route('/cancel-order/:oid')
    .patch(cancelOrder)

router.route('/save-address/:uid/:aid')
    .patch(updateUserAddress)

router.route('/add-newaddres/:uid/:aid')
    .patch(addNewAddress)

router.route('/orders')
    .post(createOrders)

router.route('/verify')
    .post(verifyOrders)

router.route('/check-coupon/:uid')
    .post(checkingCoupon)

router.route('/wallet')
    .get(viewWalletPage)

router.route('/addto-wallet/:uid')
    .post(addMoney)

router.route('/delete-account/:uid')
    .delete(deleteAccount)

router.route('/download-invoice/:oid')
    .get(viewInvoice)

router.route('/referal')
    .get(viewReferalPage)

router.route('/offers')
    .get(viewUserOfferPage)

router.route('/recent-searches')
    .get(recentSearches)

router.route('/new-address')
    .get(viewNewAddressPage)

router.route('/edit-address/:aid')
    .get(viewUpdateAddressPage)
    .patch(updateAddress)

router.route('/address')
    .post(newAddress)

router.route('/delete-address/:addressId')
.get(deleteAddress);

router.route('/edit-profile')
.get(viewEditProfilePage)
.patch(profileUpload.single('profileImage'), updateUserDetails)

router.route('/keep-alive').get(serverReactivation)

router.route('/*')
    .get(viewPageNotFound)

module.exports = router;
