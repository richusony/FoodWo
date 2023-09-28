
async function otpMiddleWare(req, res, next) {

    const otp = Math.floor(100000 + Math.random() * 900000);
    const message = `Your FoodWo verification OTP(One-Time-Password) is ${otp}`;
    try {
        const accountSid = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_ACCESS_TOKEN;
        const client = require('twilio')(accountSid, authToken);
        await client.messages.create({
            body: message,
            from: '+17854652553',
            to: '+919947619644'
        }).then(() => {
            // Assuming `callingOtpFunc` is a middleware as well
            callingOtpFunc()(req, res);
        });
    } catch (error) {
        // Handle error
        console.error(error);
    }
    next(); // Call next to continue the middleware chain
}




function callingOtpFunc() {
    return 
}
