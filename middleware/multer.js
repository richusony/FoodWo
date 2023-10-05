// multer.js

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination directory where uploaded images will be stored.
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    // Define the filename for the uploaded image.
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination directory for main images.
    cb(null, 'products');
  },
  filename: function (req, file, cb) {
    console.log('not main')
    // Define the filename for main images.
    cb(null, Date.now() + '-' + file.originalname);
  },
});



// Corrected the multer configurations for mainImageUpload and relatedImageUpload.
const productUpload = multer({ storage: productStorage });

module.exports = { upload, productUpload };
