const crypto = require('crypto');
const Razorpay = require('razorpay')



async function createOrders(req, res) {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZOR_PAY_KEY_ID,
            key_secret: process.env.RAZOR_PAY_SECRET_KEY
        });

        const options = {
            amount: parseInt(req.body.amount) * 100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: "something went wrong" });
            }
            res.status(200).json({ data: order });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

async function verifyOrders(req, res) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        console.log('body : ', req.body)
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        console.log('sign : ', sign)
        const expectedSign = crypto.createHmac("sha256", process.env.RAZOR_PAY_SECRET_KEY).update(sign.toString()).digest("hex");
        console.log('exsign : ', expectedSign)

        if (razorpay_signature == expectedSign) {
            res.status(200).json({ message: "payment verified successfully" })
        } else {
            res.status(400).json({ message: "Invalid Signature sent" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = {
    createOrders,
    verifyOrders
}