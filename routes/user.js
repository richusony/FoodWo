const express = require('express');
const router = express.Router();
const {userAuth} = require('../middleware/sessionAuth')
const {isBlocked}= require('../middleware/userBlocked')
const upload = require('../middleware/multer')
const {signInUser,addToWishlist,viewSignInPage, viewLoginInPage, loginUser, productPage, otppage, otpVerification, logoutUser, viewCartPage, removeFromWishlist, addToCart, removeFromCart, viewWishlistPage, viewForgotPasswordPage, viewverifyPhonePage, sendResetUrl, updateNewPassword, viewUserProfile, updateUserProfile} = require('../controllers/user')



// User SignUp Get Request
router.route('/signup')
.get(viewSignInPage)
.post(signInUser);

// User Login Get Request
router.route('/login')
.get(viewLoginInPage) 
.post(loginUser)



// User Products Page Get Request
router.route('/products').get(productPage)

// User SignIn Post Request
router.post('/signin',signInUser)   

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

router.route('/wishlist/')
.get(viewWishlistPage)  

router.route('/userProfile/:id')
.get(viewUserProfile)
.post(upload.single('image'),updateUserProfile)

// User Session Middleware
router.use(userAuth)

// Checking wether User is Blocked or Not
router.use(isBlocked)

router.route('/cart/:id')
.get(viewCartPage)

router.route('/addToCart')
.post(addToCart)

router.route('/logout')
.get(logoutUser)

router.route('/addWishlist/:fid/:uid')
.post(addToWishlist)

router.route('/removeFromCart/')
.post(removeFromCart)



module.exports = router;