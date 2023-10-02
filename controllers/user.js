const { userModel } = require('../models/userSchema');
const productModel = require('../models/productSchema');
const wishListModel = require('../models/wishlistSchema');
const categoryModel = require('../models/categorySchema');
const bcrypt = require('bcrypt');
const { sessAuth } = require("../middleware/sessionAuth");
const cartModel = require('../models/cartSchema');

function viewSignInPage(req, res) {
    res.render('userSignUp')
}
function viewLoginInPage(req, res) {
    res.render('userLogin')
}

// Function to generate a random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Function to send OTP via Twilio
async function sendOTP(phone, otp) {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_ACCESS_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const message = `Your FoodWo verification OTP(One-Time-Password) is ${otp}`;

    await client.messages.create({
        body: message,
        from: '+17854652553',
        to: phone
    });
}


// SignUp POST Request
async function signInUser(req, res) {
    console.log(req.body);
    const { fullname, email, phone, address, password, baseImage } = req.body;
    const userExistsEmail = await userModel.findOne({ email: email });
    const userExistsPhone = await userModel.findOne({ phone: phone });
    if (!fullname || !email || !phone || !address || !password) {
        return res.json({ msg: "All fields required!!" });
    } else if (userExistsEmail) {
        return res.status(401).json({ failed: "User already exists with this email" })
    }
    else if (userExistsPhone) {
        return res.status(401).json({ failed: "User already exists with this phone no." })
    } else {
        try {
            // Generate and send OTP
            const otp = generateOTP();
            await sendOTP('+919947619644', otp);

            // Store OTP and user input data in session
            req.session.otp = otp;
            req.session.userData = {
                fullname,
                email,
                phone,
                address,
                password,
                baseImage
            };

            // Redirect to OTP verification page
            res.redirect('/user/otpVerify');
        } catch (err) {
            console.error(err);
        }
    }
}

// Login POST Request
async function loginUser(req, res) {
    const { email, password } = req.body;
    console.log(email, password);

    const users = await userModel.findOne({ email: email });

    if (users) {
        if (users.blocked) {
            res.status(401).json({ failed: 'user is blocked.' })
        } else {
            const isPasswordValid = await bcrypt.compare(password, users.password);
            if (isPasswordValid) {
                req.session.user = users;
                res.status(201).json({ success: 'logged in.', user: users });
            } else {
                res.status(401).json({ failed: 'wrong password' });
            }
        }
    } else {
        res.status(401).json({ failed: 'user doesnot exists.' });
    }
}

function otppage(req, res) {
    res.render('otpVerify')
}


// OTP Verification POST Request
function otpVerification(req, res) {
    const userInputOtp = parseInt(req.body.otp);
    const storedOtp = parseInt(req.session.otp);

    console.log("userInput : " + userInputOtp + " storeotp : " + storedOtp)

    if (userInputOtp === storedOtp) {
        // OTP is valid, retrieve user input data from session
        const userData = req.session.userData;
        console.log("till here")
        if (!userData) {
            return res.status(500).json({ error: "User data not found" });
        }
        console.log("also here");

        // Create the user account
        const { fullname, email, phone, address, password, baseImage } = userData;
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Save user data to the database
        const newUser = new userModel({
            fullname,
            email,
            phone,
            address,
            password: hashedPassword,
            image: baseImage,
            blocked: false,
            purchaseCount: 0,
        });

        newUser.save()
            .then(() => {
                // Clear OTP and user data from session
                delete req.session.otp;
                delete req.session.userData;
                res.status(201).json({ success: "Account created" });
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ error: "Error creating user account" });
            });
    } else {
        res.status(401).json({ failed: 'Invalid OTP' });
    }
}

//User Proudcts Home Page 

async function productPage(req, res) {
    const userId = req.session.user?._id;
    const products = await productModel.find({});
    const wishlist = await wishListModel.aggregate(
        [
            {
                $match: { userId: userId }
            },
            {
                $project: {
                    _id: 0,
                    foodId: 1,
                }
            }
        ]
    )
    const categories = await categoryModel.aggregate([{ $sample: { size: 1 } }]);
    console.log(categories[0].category)
    const catProducts = await productModel.find({ category: categories[0].category })
    // console.log("random :: ",categories);
    res.render('mainProducts', { data: products, category: catProducts, userId: userId, wishData: wishlist });
}

async function viewCartPage(req, res) {
    const uid = req.params.id;
    const foodItems = await cartModel.aggregate(
        [
            {
                $match: { userId: uid }
            },
            {
                $project: {
                    _id: 0,
                    foodId: 1,
                    quantity: 1,
                }
            }
        ]
    );

    const foodIds = foodItems.map(item => item.foodId);
    const cartItems = await productModel.find({ _id: { $in: foodIds } });
    res.render('../views/userCart', { cartItems: cartItems, userId: uid });
}

async function addToCart(req, res) {
    const { userid, foodid } = req.body;

    const exists = await cartModel.findOne({ foodId: foodid, userId: userid });
    if (exists) {
        res.status(200).json({ exist: 'item already exists in cart.' })
    } else {
        const adding = await cartModel.create({ userId: userid, foodId: foodid, quantity: 1 });
        if (adding) {
            res.status(200).json({ added: 'item added to cart.' })
        } else {
            res.status(500).json({ err: 'Database is having an issue.' })
        }
    }
}

async function removeFromCart(req, res) {
    const { foodid, userid } = req.body;
    const deleting = await cartModel.deleteOne({ userId: userid, foodId: foodid })
    if (deleting) {
        res.status(200).json({ deleted: true })
    } else {
        res.status(500).json({ err: "Database is having an issues.." })
    }
}

async function logoutUser(req, res) {
    req.session.destroy();
    res.redirect('/user/login')
}

async function addToWishlist(req, res) {
    const userid = req.params.uid;
    const foodid = req.params.fid;

    const exists = await wishListModel.findOne({ foodId: foodid, userId: userid })
    if (exists) {
        const deleting = await wishListModel.deleteOne({ foodId: foodid, userId: userid })
        res.status(200).json({ added: false })
    } else {

        const adding = await wishListModel.create({ foodId: foodid, userId: userid })
        if (adding) {
            res.status(200).json({ added: true })
        } else {
            res.status(500).json({ err: "Database is having some issues.." })
        }
    }
}

function viewForgotPasswordPage(req, res) {
    const uid = req.params.id;
    res.render('../views/forgotPassword.ejs', { userid: uid })
}

async function viewWishlistPage(req, res) {
    res.render('../views/userWishlist.ejs')
}

function viewverifyPhonePage(req, res) {
    res.render('../views/userNumberVerify.ejs');
}

async function updateNewPassword(req, res) {
    const { newPassword, userid } = req.body;
    console.log(newPassword, userid)
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const updating = await userModel.updateOne({ _id: userid }, { password: hashedPassword })
    if (updating) {
        res.status(200).json({ updated: true })
    } else {
        res.status(400).json({ err: 'Database is having an issue.' })
    }
}

async function sendResetUrl(req, res) {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_ACCESS_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const phone = req.body.phone;
    const exist = await userModel.findOne({ phone: phone })

    if (exist) {
        const message = `your reset url  is http://localhost:8080/user/forgotPassword/${exist._id}`;
        const sending = await client.messages.create({
            body: message,
            from: '+17854652553',
            to: '+919947619644'
        });
        if (sending) {
            res.status(200).json({ sended: true })
        } else {
            res.status(500).json({ sended: false })
        }
    } else {
        res.status(401).json({ err: 'This phone is not registered.' })
    }
}

async function viewUserProfile(req, res) {
    const id = req.params.id;

    const userDetails = await userModel.findOne({ _id: id });

    if (userDetails) {

        res.render('../views/userProfile.ejs', { userData: userDetails })
    } else {
        res.status(500).json({ err: 'Database is having an issue.' })
    }
}

async function updateUserProfile(req, res) {
    const { userid, fullname, email, phone, address } = req.body;
    const image = req.file?.path;
    const updating = await userModel.updateOne({ _id: userid }, { fullname: fullname, email: email, phone: phone, address: address, image: image })
    if (updating) {
        res.status(200)
    } else {
        res.status(503).json({ err: "Couldn't update the new details." })
    }

}



module.exports = {
    signInUser,
    viewSignInPage,
    viewLoginInPage,
    loginUser,
    productPage,
    otppage,
    otpVerification,
    logoutUser,
    viewCartPage,
    addToWishlist,
    addToCart,
    removeFromCart,
    viewWishlistPage,
    viewForgotPasswordPage,
    viewverifyPhonePage,
    sendResetUrl,
    updateNewPassword,
    viewUserProfile,
    updateUserProfile
}
