const fs = require('fs');
const pdf = require("html-pdf-lts");
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sales Data');
const orderModel = require('../models/orderSchema');

async function viewSalePage(req,res){
    res.render('../views/Admin/salesReport.ejs')
}

async function salesToPdf(req, res) {
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
    pdf.create(finalTemplate, pdfOptions).toFile(`/workspaces/FoodWo/reports/Sales-Report.pdf`, function (err, pdfRes) {
        if (err) {
            console.error(err);
            res.status(500).send('Error generating PDF');
        } else {
            console.log(pdfRes); // { filename: '/app/businesscard.pdf' }

            // Send the generated PDF as a response
            res.sendFile(`Sales-Report.pdf`, { root: '/workspaces/FoodWo/reports/' });
        }
    });
}

async function salesToExcel(req, res) {
    
    // Add Header Row
    worksheet.columns = [
        { header: 'SL No', key: 'slNo', width: 10 },
        { header: 'Order ID', key: 'orderId', width: 30 },
        { header: 'DATE', key: 'createdAt', width: 20 },
        { header: 'USERID', key: 'userId', width: 30 },
        { header: 'QUANTITY', key: 'productQty', width: 10 },
        { header: 'PAYMETHOD', key: 'paymentMethod', width: 30 },
        { header: 'AMOUNT', key: 'productPrice', width: 15 },
        // Add other headers as needed
    ];

    
    // Set text alignment to center for all columns
    worksheet.columns.forEach(column => {
        column.alignment = { horizontal: 'center' };
    });
    
    let result = await orderModel.find({ orderStatus: 'Confirmed' })
    console.log(result)
    // Add Data Rows
    result.forEach(document => {
        const rowData = {
            slNo: result.indexOf(document) + 1,
            orderId: document.orderId,
            createdAt: document.created_at,
            userId: document.userId,
            productQty: document.productQty,
            paymentMethod: document.paymentMethod,
            productPrice: document.productPrice,
            // Add other properties as needed
        };
        
        worksheet.addRow(rowData);
    });
    console.log('not here');

    // Write to File
    await workbook.xlsx.writeFile('/workspaces/FoodWo/reports/Sales-Report.xlsx');
    res.status(200);
}


module.exports = {
    viewSalePage,
    salesToPdf,
    salesToExcel
};
