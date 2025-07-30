const express = require('express')
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const customerController = require("../controllers/admin/customerController")
const categoryController = require("../controllers/admin/categoryController");
const productController = require("../controllers/admin/productController");
const orderController = require('../controllers/admin/orderController'); 



const {userAuth,adminAuth} = require("../middlewares/auth")
const Category = require("../models/categorySchema");
const Product = require("../models/productSchema");


const upload = require('../middlewares/multer');
const { uploadCategory, uploadProduct } = require('../middlewares/multer');

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








//============category management===========//

// List, Search, Pagination,block,unblock




router.get("/categories", adminAuth,categoryController.getCategories);

// Add category
router.get("/categories/add",adminAuth, categoryController.addCategoryPage);
// router.post("/categories/add",adminAuth, upload.single("image"), categoryController.addCategory);
router.post("/categories/add", adminAuth, uploadCategory.single("image"), categoryController.addCategory);


// Edit category
router.get("/categories/edit/:id", adminAuth,categoryController.editCategoryPage);

router.post("/categories/edit/:id", adminAuth, uploadCategory.single("image"), categoryController.editCategory);

// Soft delete
router.post("/categories/delete/:id",adminAuth, categoryController.softDeleteCategory);

// Recovery list
router.get("/categories/recovery",adminAuth, categoryController.recoveryPage);



// Fetch deleted categories
router.get('/categories/deleted',adminAuth, async (req, res) => {
    const deletedCategories = await Category.find({ isDeleted: true });
    res.render('deletedCategories', { deletedCategories });
  });
  



router.get('/categories/recover/:id', adminAuth, async (req, res) => {
  try {
    // Recover the category
    const category = await Category.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Recover related products
    await Product.updateMany(
      { category: category._id },
      { $set: { isDeleted: false } }
    );

    res.redirect('/admin/categories/deleted');
  } catch (error) {
    console.error("Error recovering category:", error);
    res.status(500).send("Internal Server Error");
  }
});




router.post('/categories/block/:id', categoryController.blockCategory);
router.post('/categories/unblock/:id', categoryController.unblockCategory);



//================== Product Management ==================//
// Show form to add product
router.get('/products/add', adminAuth, productController.getAddProductForm);

// Handle product creation

router.post('/products/add', adminAuth, uploadProduct.array('images', 5), resizeProductImages, productController.postAddProduct);

// List active products
router.get('/products', adminAuth, productController.getAllProducts);

// Soft delete a product
router.get('/products/delete/:id', adminAuth, productController.softDeleteProduct);

// Edit product form
router.get('/products/edit/:id', adminAuth, productController.editProductForm);

// Handle edit post

router.post('/products/edit/:id', adminAuth, uploadProduct.array('images', 5), resizeProductImages, productController.updateProduct);

// View deleted products
router.get('/products/deleted', adminAuth, productController.viewDeletedProducts);

// Recover soft-deleted product
router.post('/products/recover/:id', adminAuth, productController.recoverProduct);







// ================== Order Management ==================

router.get('/orders', adminAuth, orderController.listOrders); // ✅ List all orders
router.get('/orders/:orderId', adminAuth, orderController.viewOrderDetails); // ✅ View single order
router.post('/orders/update-status/:orderId', adminAuth, orderController.updateOrderStatus); // ✅ Update status
router.post('/orders/verify-return/:orderId/:itemId', adminAuth, orderController.verifyReturnRequest); // ✅ Verify return request


module.exports = router;
