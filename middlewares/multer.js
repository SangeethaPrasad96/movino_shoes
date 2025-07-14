const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper to create folder-specific storage
const createStorage = (folderName) => {
  const folderPath = path.join(__dirname, `../public/uploads/${folderName}`);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, folderPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, filename);
    },
  });
};

// File type filter
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only jpg, jpeg, png allowed'), false);
};

// 2MB size limit
const limits = { fileSize: 2 * 1024 * 1024 };

module.exports = {
  uploadCategory: multer({ storage: createStorage('categories'), fileFilter, limits }),
  uploadProduct: multer({ storage: createStorage('products'), fileFilter, limits })
};




