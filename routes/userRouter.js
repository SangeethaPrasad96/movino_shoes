const express = require('express')
const router = express.Router();
const userController = require("../controllers/user/userController");
const passport = require('../config/passport');

router.get("/pageNotFound",userController.pageNotFound);
router.get('/',userController.loadHomepage);
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
router.get('/profile', (req, res) => {
    // Render the profile page
    res.render('profile', { user: req.session.user });
});

module.exports = router;