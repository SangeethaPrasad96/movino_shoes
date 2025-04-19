const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Destination folder for original uploads
const destinationPath = path.join(__dirname, '../public/uploads/temp');
if (!fs.existsSync(destinationPath)) {
  fs.mkdirSync(destinationPath, { recursive: true });
}

// Configure diskStorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, filename);
  }
});

// Filter only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, png files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

module.exports = upload;



