const express = require('express')
const router = express.Router();
const userController = require("../controllers/user/userController");
const passport = require('../config/passport');
const productController = require('../controllers/admin/productController');

const {userAuth,adminAuth} = require("../middlewares/auth")

router.get("/pageNotFound",userController.pageNotFound);

//hoempage and shopping page
router.get('/',userController.loadHomepage);
router.get('/shop',userController.getShopPage); //for shopping products



router.get('/signup',userController.loadSignup);
router.post('/signup',userController.signup);
router.post("/verify-otp",userController.verifyOtp);
router.post("/resend-otp",userController.resendOtp)


router.get("/auth/google",passport.authenticate("google",{scope:['profile','email']}));
router.get("/auth/google/callback",passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
});

router.get("/login",userController.loadLogin);
router.post("/login",userController.login);

router.get('/logout', userController.logout);  // Logout route
router.get('/profile', userAuth,(req, res) => {
    // Render the profile page
    res.render('profile', { user: req.session.user });
});



// router.get('/our-products', productController.getUserProducts);



router.get('/products', productController.searchProducts);

router.get('/product-detail/:id', userController.getProductDetail);


module.exports = router;