const express = require('express')
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const customerController = require("../controllers/admin/customerController")
const categoryController = require("../controllers/admin/categoryController");
const productController = require("../controllers/admin/productController");


const {userAuth,adminAuth} = require("../middlewares/auth")
const Category = require("../models/categorySchema");
const Product = require("../models/productSchema");


const upload = require('../middlewares/multer');
const resizeProductImages = require('../middlewares/imageResize');



// const multer = require("multer");
// const path = require("path");

//============Admin Auth ===============
router.get("/pageerror",adminController.pageerror)
router.get('/login',adminController.loadLogin);
router.post('/login',adminController.login);
router.get('/',adminAuth,adminController.loadDashboard);
router.get("/logout",adminController.logout);



//===========customer management============

// router.get("/users",adminAuth,customerController.customerInfo);
router.post("/toggle-status/:id", adminAuth, customerController.toggleUserStatus);
router.get("/users", adminAuth, customerController.getUsers);
router.patch("/users/:id/block", customerController.toggleBlockUser);



// Setup multer for file upload
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "public/uploads/categories");
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + path.extname(file.originalname));
//     },
//   });
//   const upload = multer({ storage });




//============category management===========//

// List, Search, Pagination
router.get("/categories", adminAuth,categoryController.getCategories);

// Add category
router.get("/categories/add",adminAuth, categoryController.addCategoryPage);
router.post("/categories/add",adminAuth, upload.single("image"), categoryController.addCategory);

// Edit category
router.get("/categories/edit/:id", adminAuth,categoryController.editCategoryPage);
router.post("/categories/edit/:id", adminAuth,upload.single("image"), categoryController.editCategory);

// Soft delete
router.post("/categories/delete/:id",adminAuth, categoryController.softDeleteCategory);

// Recovery list
router.get("/categories/recovery",adminAuth, categoryController.recoveryPage);


// Fetch deleted categories
router.get('/categories/deleted',adminAuth, async (req, res) => {
    const deletedCategories = await Category.find({ isDeleted: true });
    res.render('deletedCategories', { deletedCategories });
  });
  
  // Recover a category
  router.get('/categories/recover/:id',adminAuth, async (req, res) => {
    await Category.findByIdAndUpdate(req.params.id, { isDeleted: false });
    res.redirect('/admin/categories/deleted');
  });
  

//================== Product Management ==================//
// Show form to add product
router.get('/products/add', adminAuth, productController.getAddProductForm);

// Handle product creation
router.post('/products/add', adminAuth, upload.array('images', 5), resizeProductImages, productController.postAddProduct);

// List active products
router.get('/products', adminAuth, productController.getAllProducts);

// Soft delete a product
router.get('/products/delete/:id', adminAuth, productController.softDeleteProduct);

// Edit product form
router.get('/products/edit/:id', adminAuth, productController.editProductForm);

// Handle edit post
router.post('/products/edit/:id', adminAuth, upload.array('images', 5), resizeProductImages, productController.updateProduct);

// View deleted products
router.get('/products/deleted', adminAuth, productController.viewDeletedProducts);

// Recover soft-deleted product
router.post('/products/recover/:id', adminAuth, productController.recoverProduct);

//================== Testing Route ==================//
router.post('/test-upload', upload.array('images', 5), resizeProductImages, (req, res) => {
  res.json({
    message: 'Images uploaded and resized successfully!',
    resizedImages: req.body.images
  });
});

module.exports = router;
