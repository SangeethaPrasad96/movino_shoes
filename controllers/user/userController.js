const User = require("../../models/userSchema");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt')
const Product = require('../../models/productSchema'); 

const Category = require('../../models/categorySchema');




const loadHomepage = async (req, res) => {
    try {
        const user = req.session.user;

        // Fetch 6 latest active products
        const products = await Product.find({ isDeleted: false }).limit(6);

        if (user) {
            const userData = await User.findOne({ _id: user._id });
            return res.render("home", { user: userData, products }); // Pass products here
        } else {
            return res.render('home', { user: null, products }); // Also pass products when no user
        }
    } catch (error) {
        console.log("Error in loading homepage:", error);
        res.status(500).send('Server error');
    }
};




const loadSignup = async (req, res) => {
    try {
        return res.render("signup");
    } catch (error) {
        console.log('Signup Page not loading:', error);
        res.status(500).send('Server Error');
    }
};

//function to generate 0tp

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString(); //random 6 digit generation

}
//defining function
async function sendVerificationEmail(email,otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        });
       
        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify your account",
            text: `Your OTP IS ${otp}`,
            html: `<b>Your OTP: ${otp}</b>`,
        });

        return info.accepted.length > 0;
    } catch (error) {
        console.error("Error sending email", error);
        return false;
    }
}


const signup = async (req, res) => {

    try {
        const { name,email, password } = req.body;
        const cPassword = req.body['confirm-password'];
        
         if (password !== cPassword) {

            return res.render("signup", { message: "Passwords do not match" });
        }
        //checking the user so for that fetching the user from database

      
        const findUser = await User.findOne({ email });
        console.log("👤 User found:", findUser);
        if (findUser) {
            return res.render('signup', { message: "User with this email already exists" });
        }

        //otp generation
        const otp = generateOtp();
        console.log("✅ Generated OTP:", otp);


        const emailSent = await sendVerificationEmail(email, otp);
        console.log("Email Sent Status:", emailSent); 

        if (!emailSent) {
            console.error("❌ Email sending failed");
            return res.json("email.error");
        }

        req.session.userOtp = otp;
        req.session.userData = { name,email, password };

        res.render("verify-otp"); 
        console.log("OTP Sent", otp);

    } catch (error) {
        console.error("signup error", error);
        res.redirect("/pageNotFound");
    }
};

const securePassword = async(password)=>{
    try {
        
        const passwordHash = await bcrypt.hash(password,10)

        return passwordHash;


    } catch (error) {
        
    }
}


//otp verification

const verifyOtp = async (req,res)=>{
    try {
        const {otp}=req.body;

       
        console.log("Entered OTP:", otp);
        console.log("Session OTP:", req.session.userOtp)

     if(otp===req.session.userOtp){
        const user = req.session.userData
        //secure the password
        const passwordHash = await securePassword(user.password);


        //save user data to database
        const saveUserData = new User({
            name:user.name,
            email:user.email,
            password:passwordHash,

        })

        await saveUserData.save();

        // Store user ID in session after successful signup
        req.session.user = saveUserData._id;


          // Clear OTP and user data from session after successful verification
          req.session.userOtp = null;
          req.session.userData = null;


  // Redirect to login page with success message
 
    //       // Redirect to homepage
   
    return res.json({success:true,redirectUrl:"/login"})
    // return res.redirect('/login');
     }else{
        res.status(400).json({success:false,message:"Invalid OTP,Please try again"})     //invalid otp
     }

    } catch (error) {
        console.error("Error verifying OTP",error);
        res.status(500).json({success:false,message:"An error occured"})

        
    }
}


//resend otp
const resendOtp = async (req,res)=>{
    try {
        const {email} = req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session"})
        }

        const otp = generateOtp();
        req.session.userOtp = otp;


        const emailSent = await sendVerificationEmail(email,otp);
        if(emailSent){
            console.log("Resend OTP:",otp)
            res.status(200).json({success:true,message:"OTP Resend Successfully"})
        }else{
            res.status(500).json({success:false,message:"Failed to resend OTP.Please try again"})
        }
    } catch (error) {
        console.error("Error resending OTP",error);
        res.status(500).json({success:false,message:"Internal Server Error.Please try again"})
    }
}


const loadLogin = async(req,res)=>{
try {
    if(!req.session.user){
        return res.render("login")
    }else{
        res.redirect("/")
    }
} catch (error) {
    res.redirect("/pageNotFound")
    console.error
}
}





const pageNotFound = async (req, res) => {
    try {
        res.render("page-404");
    } catch (error) {
        res.redirect("/pageNotFound");
    }
};




const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ isAdmin: 0, email: email });

        if (!findUser) {
            return res.render("login", { message: "User not found" });
        }
        if (findUser.isBlocked) {
            return res.render("login", { message: "User is blocked by admin" });
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);

        if (!passwordMatch) {
            return res.render("login", { message: "Incorrect Password" });
        }

        req.session.user = findUser; // Store the whole user object in session
        res.redirect("/"); // Redirect to the homepage after login
    } catch (error) {
        console.error("Login error", error);
        res.render("login", { message: "Login failed, try again later" });
    }
};



const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');  // Redirect to login page after logout
    });
};



const getShopPage = async (req, res) => {
  try {
    // Get filter parameters from query string
    const query = req.query.query || '';
    const sort = req.query.sort || '';
    const selectedCategory = req.query.category || '';
    const selectedSubCategory = req.query.subCategory || '';
    const priceMin = req.query.priceMin ? Number(req.query.priceMin) : '';
    const priceMax = req.query.priceMax ? Number(req.query.priceMax) : '';
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4; // Products per page
    const skip = (page - 1) * limit;
    
    // Build the query object for MongoDB
    const filterQuery = {};
    
    // Text search if query parameter exists
    if (query) {
      filterQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (selectedCategory) {
      filterQuery.category = selectedCategory;
    }
    
    // Subcategory filter
    if (selectedSubCategory) {
      filterQuery.subCategory = selectedSubCategory;
    }
    
    // Price range filter
    if (priceMin !== '' || priceMax !== '') {
      filterQuery.price = {};
      
      if (priceMin !== '') {
        filterQuery.price.$gte = priceMin;
      }
      
      if (priceMax !== '') {
        filterQuery.price.$lte = priceMax;
      }
    }
    
    // Build sort options
    let sortOptions = {};
    
    switch (sort) {
      case 'low-to-high':
        sortOptions = { price: 1 };
        break;
      case 'high-to-low':
        sortOptions = { price: -1 };
        break;
      case 'a-z':
        sortOptions = { name: 1 };
        break;
      case 'z-a':
        sortOptions = { name: -1 };
        break;
      default:
        // Default sort (e.g., by createdAt)
        sortOptions = { createdAt: -1 };
    }
    
    // Count total matching products for pagination
    const totalProducts = await Product.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Fetch products with filters and pagination applied
    const products = await Product.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('category')
      .lean();
    
    // Fetch all categories for the filter dropdowns
    // const categories = await Category.find({}).lean();
    const categories = await Category.find({ status: 'listed' }).lean();
    
    // Render shop page with data
    res.render('shop', {
      title: 'Shop',
      products,
      categories,
      query,
      sort,
      selectedCategory,
      selectedSubCategory,
      priceMin,
      priceMax,
      // Pagination data
      currentPage: page,
      totalPages,
      totalProducts,
      // Pass categories as JSON string for client-side JS
      categoriesJson: JSON.stringify(categories)
    });
  } catch (error) {
    console.error('Shop page error:', error);
    res.status(500).render('error', {
      message: 'An error occurred while loading the shop page'
    });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).lean();

    if (!product) {
      return res.status(404).render('404', { message: 'Product not found' });
    }

    res.render('product-detail', { product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).send("Internal Server Error");
  }
};





module.exports = {
    loadHomepage,
    pageNotFound,
    loadSignup,
    signup,
    verifyOtp,
    resendOtp,
    loadLogin,
    login,
    logout,
    getShopPage,
    getProductDetail,
};