const express = require('express')
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const customerController = require("../controllers/admin/customerController")
const categoryController = require("../controllers/admin/categoryController");
const {userAuth,adminAuth} = require("../middlewares/auth")
const Category = require("../models/categorySchema");


const multer = require("multer");
const path = require("path");

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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });




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
  



module.exports = router;