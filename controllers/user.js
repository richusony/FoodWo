const { userModel } = require('../models/userSchema');
const productModel = require('../models/productSchema');
const categoryModel = require('../models/categorySchema');
const bcrypt = require('bcrypt');
const { sessAuth } = require("../middleware/sessionAuth");

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
    const products = await productModel.find({});
    const categories = await categoryModel.aggregate([{ $sample: { size: 1 } }]);
    console.log(categories[0].category)
    const catProducts = await productModel.find({ category: categories[0].category })
    // console.log("random :: ",categories);
    res.render('mainProducts', { data: products, category: catProducts });
}

async function viewCartPage(req, res) {
    res.render('../views/userCart')
}

async function logoutUser(req, res) {
    req.session.destroy();
    res.redirect('/user/login')
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

}
