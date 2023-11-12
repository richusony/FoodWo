const fs = require('fs');
const pdf = require("html-pdf-lts");
const orderModel = require('../models/orderSchema');

async function viewSaleReportPage(req, res) {
    const htmlTemplate = fs.readFileSync("/workspaces/FoodWo/views/salesReport.html", "utf8");
    const salesHead = fs.readFileSync("/workspaces/FoodWo/views/salesHead.html", "utf8");
    const salesFoot = fs.readFileSync("/workspaces/FoodWo/views/salesFoot.html", "utf8");

    const orders = await orderModel.find({}).sort({ createdAt: -1 });

    // Accumulate HTML content for all orders
    let dynamicHtml = '';
    orders.forEach((order, index) => {
        dynamicHtml += htmlTemplate
            .replace('{{SLNO}}', index + 1)
            .replace('{{ORDERID}}', order.orderId)
            .replace('{{DATE}}', order.created_at)
            .replace('{{USERID}}', order.userId)
            .replace('{{QTY}}', order.productQty)
            .replace('{{PAYMETHOD}}', order.paymentMethod)
            .replace('{{AMOUNT}}', order.productPrice);
    });

    const finalTemplate = salesHead + dynamicHtml + salesFoot;

    // Create PDF from accumulated dynamic HTML
    const pdfOptions = { format: "A4" };
    pdf.create(finalTemplate, pdfOptions).toFile(`Sales-Report.pdf`, function (err, pdfRes) {
        if (err) {
            console.error(err);
            res.status(500).send('Error generating PDF');
        } else {
            console.log(pdfRes); // { filename: '/app/businesscard.pdf' }

            // Send the generated PDF as a response
            res.sendFile(`Sales-Report.pdf`, { root: './' });
        }
    });
}

module.exports = {
    viewSaleReportPage
};
