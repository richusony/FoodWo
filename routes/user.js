const express = require('express');
const router = express.Router();
const {userAuth} = require('../middleware/sessionAuth')
const {signInUser,viewSignInPage, viewLoginInPage, loginUser, productPage, otppage, otpVerification, logoutUser, viewCartPage} = require('../controllers/user')



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

// User Session Middleware
router.use(userAuth)

router.route('/cart')
.get(viewCartPage)

router.route('/logout')
.get(logoutUser)

module.exports = router;