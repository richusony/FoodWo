const fs = require("fs");
const pdf = require("html-pdf-lts");
const { invoiceModel } = require('../models/invoiceSchema');

function viewInvoice(req, res) {
    // Assuming you have a dynamic orderId from the request, fetch the corresponding invoice data
    const orderId = req.params.oid; // Adjust according to your route structure
    invoiceModel.findOne({ orderId })
        .then((invoice) => {
            if (!invoice) {
                return res.status(404).send('Invoice not found');
            }

            // Read the HTML content from the file
            const htmlTemplate = fs.readFileSync("/workspaces/FoodWo/views/invoice.html", "utf8");

            // Replace placeholders in the HTML template with actual data
            const dynamicHtml = htmlTemplate
                .replace('{{orderId}}', invoice.orderId)
                .replace('{{shippingAddress}}', invoice.shippingAddress)
                .replace('{{productName}}', invoice.productName)
                .replace('{{productQty}}', invoice.productQty)
                .replace('{{discount}}', invoice.discount || '0.00')
                .replace('{{amount}}', invoice.amount);

            // Set the Content-Disposition header to force download
            res.setHeader('Content-Disposition', `attachment; filename=${orderId}.pdf`);

            // Set the Content-Type header to indicate PDF format
            res.setHeader('Content-Type', 'application/pdf');

            // Create PDF from dynamic HTML
            const pdfOptions = { format: "Letter" };
            pdf.create(dynamicHtml, pdfOptions).toFile(`/workspaces/FoodWo/invoice/${orderId}.pdf`, function (err, pdfRes) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error generating PDF');
                } else {
                    console.log(pdfRes); // { filename: '/app/businesscard.pdf' }

                    // Send the generated PDF as a response
                    res.sendFile(`${orderId}.pdf`, { root: '/workspaces/FoodWo/invoice/' });
                }
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Internal Server Error');
        });
}

module.exports = {
    viewInvoice
};
