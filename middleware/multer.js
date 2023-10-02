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

module.exports = upload;
