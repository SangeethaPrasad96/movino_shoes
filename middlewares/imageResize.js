// const sharp = require('sharp');
// const fs = require('fs');
// const path = require('path');

// async function resizeProductImages(req, res, next) {
//   if (!req.files || req.files.length < 3) {
//     return res.status(400).send("Minimum 3 images are required.");
//   }

//   const processedImages = [];
//   const outputFolder = path.join(__dirname, '../public/uploads/products');

//   if (!fs.existsSync(outputFolder)) {
//     fs.mkdirSync(outputFolder, { recursive: true });
//   }

//   for (const file of req.files) {
//     const newFilename = 'resized-' + file.filename;
//     const outputPath = path.join(outputFolder, newFilename);

//     await sharp(file.path)
//       .resize(500, 500)
//       .toFile(outputPath);

//     // Delete the original uploaded image
//     fs.unlinkSync(file.path);

//     processedImages.push(newFilename);
//   }

//   req.body.images = processedImages;
//   next();
// }

// module.exports = resizeProductImages;



const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function resizeProductImages(req, res, next) {
  try {
    // If this is an update and no new files uploaded, skip resizing
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // If there are new files but less than 3, block it
    if (req.files.length < 3) {
      return res.redirect(`/admin/products/edit/${req.params.id}?error=minImages`);
    }

    const outputFolder = path.join(__dirname, '../public/uploads/products');
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    for (const file of req.files) {
      const newFilename = 'resized-' + file.filename;
      const outputPath = path.join(outputFolder, newFilename);

      await sharp(file.path)
        .resize(500, 500)
        .toFile(outputPath);

      fs.unlinkSync(file.path); // remove original
      file.filename = newFilename;
      file.path = outputPath;
    }

    next();
  } catch (err) {
    console.error('Error resizing images:', err);
    return res.status(500).send("Image processing failed.");
  }
}

module.exports = resizeProductImages;
