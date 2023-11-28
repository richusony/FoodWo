const { sessAuth } = require("../middleware/sessionAuth");
const productModel = require('../models/productSchema');
const wishListModel = require('../models/wishlistSchema');
const categoryModel = require('../models/categorySchema');
const cartModel = require('../models/cartSchema');
const orderModel = require('../models/orderSchema');
const { userModel } = require('../models/userSchema');
const { walletModel } = require('../models/walletSchema');
const { couponModel } = require('../models/couponSchema');
const { addressModel } = require('../models/addressSchema');
const { invoiceModel } = require('../models/invoiceSchema');
const { referModel } = require('../models/referalSchema');
const { bannerModel } = require('../models/bannerSchema');
const { productOfferModel } = require('../models/offerSchema');
const bcrypt = require('bcrypt');
const moment = require('moment');
const { fdReviewModel } = require("../models/fdReviewSchema");

function viewSignInPage(req, res) {
    res.render('userSignUp')
}
function viewLoginInPage(req, res) {
    res.render('userLogin')
}

function userSession(req, res) {
    if (req.session.user) {
        res.status(200).json({ userData: req.session.user });
    } else {
        res.status(400).json({ error: "User session not available" })
    }
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
    const { fullname, email, phone, address, password, referCode } = req.body;
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
                referCode
            };
            console.log(otp)
            // Redirect to OTP verification page
            res.redirect('/otpVerify');
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
async function otpVerification(req, res) {
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
        const { fullname, email, phone, address, password, referCode } = userData;
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Save user data to the database
        const newUser = new userModel({
            fullname,
            email,
            phone,
            password: hashedPassword,
            blocked: false,
            purchaseCount: 0,
        });

        newUser.save()
            .then(async () => {
                // Clear OTP and user data from session
                delete req.session.otp;
                delete req.session.userData;
                const addingAddress = await addressModel.create({ userId: newUser._id, address1: address, address2: false, address3: false })
                const creatingZeroWallet = await walletModel.create({ userId: newUser._id, balance: 0 });
                const findCode = await referModel.findOne({ referalCode: referCode });
                console.log("findout ::::::::: ::::::::::: ", findCode, referCode)
                if (findCode) {
                    const codeOwner = findCode.userId;
                    const currentDate = moment().format('DD-MM-YYYY'); // Get the current date in 'DD-MM-YYYY' format
                    const historyData = {
                        date: currentDate,
                        amt: 100,
                        update: "inc"
                    };
                    const addToWallet = await walletModel.updateOne({ userId: codeOwner }, {
                        $inc: { balance: 100 },
                        $push: { history: historyData }
                    })
                    const addNewUserToReferModel = await referModel.updateOne({ referalCode: referCode }, { $push: { usedUsers: newUser._id } })
                }
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
    const products = await productModel.find({}).limit(6);
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
    const banners = await bannerModel.find({}).sort({ createdAt: 1 });
    const productOffers = await productOfferModel.find({});
    // console.log("random :: ",categories);
    res.render('mainProducts', { data: products, category: catProducts, userId: userId, wishData: wishlist, banners: banners, offers: productOffers });
}

async function viewCartPage(req, res) {
    try {
        const uid = req.params.id;

        const foodItems = await cartModel.aggregate([
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
        ]);

        const wallet = await walletModel.findOne({ userId: uid });
        const foodIds = foodItems.map(item => item.foodId);
        let cartItems = await productModel.find({ _id: { $in: foodIds } });
        const userDetails = await userModel.findOne({ _id: uid });
        const addressDetails = await addressModel.findOne({ userId: uid });

        if (cartItems.length === 0) {
            cartItems = false;
        } else {
            cartItems = cartItems.map((item) => {
                item.productImages = item.productImages[0].replace(/\\/g, '/').trim();
                item.category = item.category.trim();
                return item;
            });
        }
        let offers = await productOfferModel.find({ foodId: { $in: foodIds } });
        if (offers.length <= 0) {
            offers = false;
        }
        console.log(offers)

        res.render('../views/userCart', {
            cartItems: cartItems,
            userId: uid,
            userData: userDetails,
            wallet: wallet,
            userAddress: addressDetails,
            offers: offers
        });
    } catch (err) {
        console.error('Error fetching cart details:', err);
        res.render("../views/pageNotFound.ejs");
    }
}


async function addToCart(req, res) {
    const { userid, foodid } = req.body;
    console.log("got id", userid, foodid)
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
    res.redirect('/login')
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
        const message = `your reset url  is http://localhost:8080/forgotPassword/${exist._id}`;
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
    try {
        const id = req.params.id;

        const [userDetails, addressDetails] = await Promise.all([
            userModel.findOne({ _id: id }),
            addressModel.findOne({ userId: id })
        ]);

        if (userDetails) {
            res.render('../views/userProfile.ejs', { userData: userDetails, userAddress: addressDetails || {} });
        } else {
            res.status(404).json({ err: 'User not found.' });
        }
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.redirect('../views/pageNotFound.ejs');
    }
}


async function updateUserProfile(req, res) {
    const { userid, fullname, email, phone, address1, address2, address3 } = req.body;
    const image = req.file?.path;
    console.log(address1)

    const updating = await userModel.updateOne({ _id: userid }, {
        fullname,
        email,
        phone,
        image
    }
    );
    if (updating) {
        res.status(200);
    } else {
        return res.status(400).json({ error: "Address limit reached" });
    }
    if (!address1 && !address3) {
        const updateAddress = await addressModel.updateOne({ userId: userid }, { address1: address2, address2: false, address3: false })

    } else if (!address2 && !address3) {
        const updateAddress = await addressModel.updateOne({ userId: userid }, { address1: address1, address2: false, address3: false })

    } else if (!address1 && !address2) {
        const updateAddress = await addressModel.updateOne({ userId: userid }, { address1: address3, address2: false, address3: false })
    }
    else if (!address1) {
        const updateAddress = await addressModel.updateOne({ userId: userid }, { address1: address2, address2: address3, address3: false })
    } else if (!address2) {
        const updateAddress = await addressModel.updateOne({ userId: userid }, { address1: address1, address2: address3, address3: false })
    } else if (!address3) {
        const updateAddress = await addressModel.updateOne({ userId: userid }, { address1: address1, address2: address2, address3: false })
    }
    else {
        const updateAddress = await addressModel.updateOne({ userId: userid }, { address1: address1, address2: address2, address3: address3 })
    }

}

async function addNewAddress(req, res) {
    const { uid, aid } = req.params;
    const newaddress = req.body.address;

    if (aid == 1) {
        const updating = await addressModel.updateOne({ userId: uid }, { address1: newaddress })
        if (updating) {
            res.status(200).json({ updated: true })
        } else {
            res.status(500).json({ updated: false })
        }
    } else if (aid == 2) {
        const updating = await addressModel.updateOne({ userId: uid }, { address2: newaddress })
        if (updating) {
            res.status(200).json({ updated: true })
        } else {
            res.status(500).json({ updated: false })
        }
    } else {
        const updating = await addressModel.updateOne({ userId: uid }, { address3: newaddress })
        if (updating) {
            res.status(200).json({ updated: true })
        } else {
            res.status(500).json({ updated: false })
        }
    }
}


async function updateUserAddress(req, res) {
    const { uid, aid } = req.params;
    const newaddress = req.body.address;
    const addressDetails = await addressModel.findOne({ userId: uid })
    const oldAddress1 = addressDetails.address1;
    const oldAddress2 = addressDetails.address2;
    const oldAddress3 = addressDetails.address3;
    console.log(newaddress)
    console.log(addressDetails)
    console.log(uid)
    console.log(oldAddress1)
    console.log(oldAddress2)
    console.log(oldAddress3)
    console.log("aid : ", aid)
    if (aid == 1) {
        if (newaddress === "") {
            console.log("blank")
            const updating = await addressModel.updateOne({ userId: uid }, { address1: oldAddress2, address2: oldAddress3, address3: false })
            if (updating) {
                res.status(200).json({ updated: true })
            } else {
                res.status(500).json({ updated: false })
            }
        } else {
            console.log("not blank")
            const updating = await addressModel.updateOne({ userId: uid }, { address1: newaddress })
            if (updating) {
                res.status(200).json({ updated: true })
            } else {
                res.status(500).json({ updated: false })
            }
        }

    } else if (aid == 2) {
        if (newaddress === "") {
            const updating = await addressModel.updateOne({ userId: uid }, { address2: oldAddress3, address3: false })
            if (updating) {
                res.status(200).json({ updated: true })
            } else {
                res.status(500).json({ updated: false })
            }
        } else {
            const updating = await addressModel.updateOne({ userId: uid }, { address2: newaddress })
            if (updating) {
                res.status(200).json({ updated: true })
            } else {
                res.status(500).json({ updated: false })
            }
        }
    } else {
        if (newaddress === "") {
            const updating = await addressModel.updateOne({ userId: uid }, { address3: false })
            if (updating) {
                res.status(200).json({ updated: true })
            } else {
                res.status(500).json({ updated: false })
            }
        } else {
            const updating = await addressModel.updateOne({ userId: uid }, { address3: newaddress })
            if (updating) {
                res.status(200).json({ updated: true })
            } else {
                res.status(500).json({ updated: false })
            }
        }

    }
}

async function checkingQuantity(req, res) {
    const { productId, productQty } = req.body;
    console.log('working.... :: ', productId, productQty)
    const product = await productModel.findOne({ _id: productId });

    if (product) {
        if (parseInt(productQty) > parseInt(product.productInStock)) {
            return res.status(400).json({ err: `only ${product.productInStock} left for ${product.productName}` })
        }
    }
    res.status(200).json({ success: "Qty is ok" })
}


async function updateStock(req, res) {
    const { user_id, productId, productName, image, customerName, productPrice, paymentMethod, productQty, address, coupon } = req.body;
    console.log(user_id, productId, productQty);
    let offerDiscount = 0;
    let discountAddedOrNot = false;
    let afterDiscountPrice = parseInt(productPrice);
    let discountAmount = 0;
    const currentDate = moment().format('DD-MM-YYYY');
    // const coupon = req.body.coupon;
    const productOffer = await productOfferModel.findOne({ foodId: productId });
    const existCoupon = await couponModel.findOne({ couponCode: coupon })
    const checkFood = existCoupon && existCoupon.foodId == productId;
    const product = await productModel.findOne({ _id: productId });
    if (parseInt(productQty) > parseInt(product.productInStock)) {
        return res.status(400).json({ err: `only ${product.productInStock} left for ${productName}` })
    }
    console.log('coupong : ', coupon)
    if (coupon != undefined && coupon != "") {
        if (existCoupon) {
            if (existCoupon.usedUsersCount >= existCoupon.usersLimit) {
                return res.status(400).json({ err: "Coupon has been reached the maximum users limit" })
            }
            if (checkFood) {
                if (existCoupon.status === "deactive") {
                    return res.status(500).json({ err: "This coupon has been blocked" })
                } else {
                    const userData = await userModel.findOne({ _id: user_id })
                    console.log('user : ', userData)

                    const startDate = existCoupon.startDate
                    const endDate = existCoupon.endDate
                    const usersLimit = existCoupon.usersLimit
                    const usageLimit = existCoupon.usageLimit
                    const discountType = existCoupon.discountType
                    const discountValue = existCoupon.discountValue

                    const usedOrNot = userData.usedCoupons.length == 0 ? false : userData?.usedCoupons.filter((coup) => coup && coup.couponId == existCoupon._id.toString());
                    console.log('coupon : ', usedOrNot)

                    if (usedOrNot == false || usedOrNot[0] == false) {
                        const currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0);
                        console.log(startDate, endDate)
                        if (endDate < currentDate) {
                            return res.status(400).json({ err: "coupon has been expired" })
                        } else {

                            const updateData = {
                                couponId: existCoupon._id.toString(),
                                usedCount: 1
                            }
                            console.log("usedCoupons before update: ", userModel.usedCoupons);
                            const updatingUser = await userModel.updateOne({ _id: user_id }, { $push: { usedCoupons: updateData } })
                            if (updatingUser) {
                                const updateCoupon = await couponModel.updateOne({ _id: existCoupon._id.toString() }, { $inc: { usedUsersCount: 1 } })
                                console.log(updateCoupon)
                                if (existCoupon.discountType == "per") {
                                    afterDiscountPrice = parseInt(productPrice * productQty) - (existCoupon.discountValue * parseInt(productPrice) / 100);
                                    discountAmount = (existCoupon.discountValue * parseInt(productPrice) / 100);
                                    console.log("after discount : : : : : ", afterDiscountPrice)
                                    discountAddedOrNot = true;
                                } else {
                                    afterDiscountPrice = parseInt(productQty) * parseInt(productPrice) - existCoupon.discountValue;
                                    discountAmount = existCoupon.discountValue;
                                    console.log("after discount : : : : : ", afterDiscountPrice)
                                    discountAddedOrNot = true;
                                }
                                console.log("usedCoupons after update: ", userModel.usedCoupons);
                            } else {
                                return res.status(500).json({ added: false, err: "Database is having some issues" })
                            }
                        }
                    } else {
                        const findCoupon = usedOrNot.filter((coup) => coup && coup.couponId == existCoupon._id.toString());
                        console.log('findcoupon', findCoupon)
                        const usedCount = parseInt(findCoupon[0].usedCount);
                        if (usedCount >= usageLimit) {
                            return res.status(400).json({ added: false, err: "reached coupon limit." })
                        } else {
                            const updating = await userModel.updateOne({ _id: user_id, 'usedCoupons.couponId': findCoupon[0].couponId },
                                { $inc: { 'usedCoupons.$.usedCount': 1 } })
                            if (updating) {
                                if (existCoupon.discountType == "per") {
                                    afterDiscountPrice = parseInt(productQty) * parseInt(productPrice) - (existCoupon.discountValue * parseInt(productPrice) / 100);
                                    console.log("after discount : : : : : ", afterDiscountPrice)
                                    discountAmount = (existCoupon.discountValue * parseInt(productPrice) / 100);
                                } else {
                                    afterDiscountPrice = parseInt(productQty) * parseInt(productPrice) - existCoupon.discountValue;
                                    discountAmount = existCoupon.discountValue;
                                }
                                console.log("coupon added")
                            } else {
                                return res.status(500).json({ added: false, err: "Database is having some issues" })
                            }
                        }
                    }
                }
            }

        } else {
            return res.status(404).json({ err: "Coupon not found" })
        }
    }
    if (productOffer) {
        if (productOffer.discountType == "per") {
            offerDiscount = parseInt(productOffer.discountValue * productOffer.actualPrice / 100);
        } else {
            offerDiscount = parseInt(productOffer.discountValue)
        }
    }
    function generateOrderID() {
        // Generate a random number between 1000 and 9999
        const randomPart = Math.floor(Math.random() * 9000) + 1000;

        // Create a timestamp part using the current time
        const now = new Date();
        const timestampPart = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

        // Combine the random part and timestamp part
        const orderID = `ORD${timestampPart}${randomPart}`;

        return orderID;
    }
    const orderId = generateOrderID();
    console.log(orderId)
    try {
        // Assuming you have a 'productModel' and relevant fields in your MongoDB model
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.productInStock <= 0) {
            return res.status(404).json({ err: 'Stock out' })
        } else {

            // Calculate the updated stock quantity by subtracting 'productQty'
            const updatedStock = product.productInStock - productQty;

            // Increment 'productSold' by 'productQty' and 'purchaseCount' by 1
            const result = await productModel.updateOne(
                { _id: productId },
                {
                    $set: { productInStock: updatedStock },
                    $inc: { productSold: productQty, purchaseCount: 1 }
                }
            );

            const addToOrder = await orderModel.create({ orderId: orderId, userId: user_id, customerName: customerName, productId: productId, productName: productName, productQty: productQty, productImage: image, productPrice: afterDiscountPrice - offerDiscount, address: address, paymentMethod: paymentMethod, orderStatus: 'Pending' })

            const updating = await userModel.updateOne(
                { _id: user_id },
                {
                    $inc: { purchaseCount: 1 }
                })

            if (existCoupon && existCoupon.foodId == productId) {
                if (paymentMethod == "FoodWo Wallet") {
                    const historyData = {
                        date: currentDate,
                        amt: afterDiscountPrice - offerDiscount,
                        update: "dec"
                    };

                    const calculatedAmount = (parseInt(productPrice) * parseInt(productQty)) - productPrice;
                    console.log('Calculated.... : : ', calculatedAmount);
                    console.log('Reduced.... : : ', calculatedAmount + afterDiscountPrice);
                    const walletUpdate = await walletModel.updateOne(
                        { userId: user_id },
                        {
                            $inc: { balance: -(afterDiscountPrice - offerDiscount) }, // Decrement the balance
                            $push: { history: historyData }
                        }
                    );
                }
            } else {
                if (paymentMethod == "FoodWo Wallet") {
                    const historyData = {
                        date: currentDate,
                        amt: (parseInt(productPrice) * parseInt(productQty) - offerDiscount),
                        update: "dec"
                    };
                    const walletUpdate = await walletModel.updateOne(
                        { userId: user_id },
                        {
                            $inc: { balance: -(parseInt(productPrice) * parseInt(productQty) - offerDiscount) }, // Decrement the balance
                            $push: { history: historyData }
                        }
                    );
                }
            }


            if (result) {
                console.log("discounted AMOUnt :::: ", discountAmount.toFixed(2))
                const createInvoice = await invoiceModel.create({ userId: user_id, orderId: orderId, productId: productId, productName: productName, productQty: productQty, shippingAddress: address, discount: offerDiscount == 0 ? discountAmount.toFixed(2) : offerDiscount, amount: afterDiscountPrice - offerDiscount, paymentMethod: paymentMethod })
                res.status(200).json({ orderid: orderId, address: address });

            } else {
                console.log('not here')
                return res.status(500).json({ error: 'Failed to update stock' });
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

    const user = await userModel.findById(user_id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }


}

async function viewProductDetailsPage(req, res) {
    try {
        const id = req.params.id;
        const userId = req.session.user?._id;
        
        const wishlist = await wishListModel.aggregate([
            { $match: { userId: userId } },
            { $project: { _id: 0, foodId: 1 } }
        ]);
        
        const productOffer = await productOfferModel.findOne({ foodId: id });
        const foodDetails = await productModel.findOne({ _id: id });

        if (!foodDetails) {
            // Handle case where product details are not found
            return res.status(404).send('Product not found');
        }

        const fdReviews = await fdReviewModel.find({ foodId: id });

        // Fetch user details for each review
        const reviewsWithUserDetails = await Promise.all(
            fdReviews.map(async (review) => {
                const user = await userModel.findOne({ _id: review.userId });
                return {
                    review,
                    user: {
                        fullname: user.fullname,
                        image: user.image,
                        // Include any other user details you need
                    },
                };
            })
        );
        console.log(reviewsWithUserDetails)
        if (productOffer) {
            res.render('../views/productDetails.ejs', { userId, food: foodDetails, wishData: wishlist, offers: productOffer, reviews: reviewsWithUserDetails });
        } else {
            res.render('../views/productDetails.ejs', { userId, food: foodDetails, wishData: wishlist, offers: false, reviews: reviewsWithUserDetails });
        }
    } catch (error) {
        // Handle any caught errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


async function viewMyOrderPage(req, res) {
    const user_id = req.params.id;
    const allOrders = await orderModel.find({ userId: user_id }).sort({ createdAt: -1 })
    res.render('../views/userOrders.ejs', { orders: allOrders })
}

async function viewOrderSuccessPage(req, res) {
    res.render('../views/orderSuccess.ejs')
}

async function viewOrderItemPage(req, res) {
    try {
        const orderId = req.params.oid;
        const orderedItem = await orderModel.findOne({ orderId: orderId });

        if (!orderedItem) {
            return res.render("../views/pageNotFound.ejs")
        }

        const userId = orderedItem.userId;
        const userDetails = await userModel.findOne({ _id: userId });

        if (!userDetails) {
            return res.status(404).json({ err: 'User details not found.' });
        }

        res.render('../views/orderedItem.ejs', { order: orderedItem, user: userDetails });
    } catch (err) {
        console.error('Error fetching order item details:', err);
        res.render("../views/pageNotFound.ejs")
    }
}



async function cancelOrder(req, res) {
    const orderId = req.params.oid;
    const orderDetails = await orderModel.findOne({ orderId: orderId });
    const productId = orderDetails.productId;
    const userId = orderDetails.userId;
    const purchasedPrice = parseInt(orderDetails.productPrice);
    const purchasedQty = parseInt(orderDetails.productQty);
    if (orderId) {
        const updating = await orderModel.updateOne({ orderId: orderId }, { orderStatus: "Cancelled" })
        if (updating) {
            const updateProductQty = await productModel.updateOne({ _id: productId }, { $inc: { productInStock: purchasedQty, productSold: -purchasedQty } })
            const currentDate = moment().format('DD-MM-YYYY'); // Get the current date in 'DD-MM-YYYY' format
            const historyData = {
                date: currentDate,
                amt: purchasedPrice * purchasedQty,
                update: "inc"
            };
            const refundToWallet = await walletModel.updateOne({ userId: userId }, { $inc: { balance: purchasedPrice * purchasedQty }, $push: { history: historyData } })
            if (refundToWallet) {
                res.status(200).json({ updated: true, refund: true })
            } else {
                res.status(400).json({ updated: true, refund: false })
            }
        } else {
            res.status(400).json({ updated: false, refund: false })
        }
    }
}

async function deleteAccount(req, res) {
    const userId = req.params.uid;
    const deleting = await userModel.deleteOne({ _id: userId });
    if (deleting) {
        const deleteAddress = await addressModel.deleteOne({ userId: userId })
        const deleteCart = await cartModel.deleteOne({ userId: userId })
        const deleteWishlist = await wishListModel.deleteOne({ userId: userId })
        const deleteWallet = await walletModel.deleteOne({ userId: userId })
        res.status(200).json({ deleted: true });
    } else {
        res.status(400).json({ deleted: false })
    }
}

function viewPageNotFound(req, res) {
    console.log("Page not found!!!!!!!!!!");
    if (req.session.admin) {
        res.render("../views/Admin/pageNotFound.ejs")
    } else {
        res.render("../views/pageNotFound.ejs")
    }
}

async function getAllfoodItems(req, res) { 
    const foodLimit = 2;
    const foodSkip = req.query.items;
    const allFood = await productModel.find({}).limit(foodLimit).skip(foodSkip).sort({createdAt:-1});
    if (allFood) {
        res.status(200).json({ food: allFood });
    }
    else {
        res.status(400).json({ food: false });
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
    viewForgotPasswordPage,
    viewverifyPhonePage,
    sendResetUrl,
    updateNewPassword,
    viewUserProfile,
    updateUserProfile,
    updateStock,
    viewProductDetailsPage,
    viewMyOrderPage,
    viewOrderSuccessPage,
    viewOrderItemPage,
    cancelOrder,
    updateUserAddress,
    addNewAddress,
    checkingQuantity,
    deleteAccount,
    viewPageNotFound,
    userSession,
    getAllfoodItems
}
