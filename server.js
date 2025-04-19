const express = require("express")
const path = require("path")
const dotenv = require("dotenv");
const session = require("express-session")
const db = require("./config/db")
const userRouter= require('./routes/userRouter')
const passport = require("./config/passport");
const adminRouter = require('./routes/adminRouter')
const flash = require('connect-flash');


dotenv.config();
const app = express()
db()

//trial
app.use('/uploads/products', express.static(path.join(__dirname, 'public/uploads/products')));

app.use(express.static(path.join(__dirname, 'public')));
//middleware to convert json
app.use(express.json());
app.use(express.urlencoded({extended:true}))//query string data conversion
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))

//cache 
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
  });
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


app.set("view engine","ejs")
app.set("views",[path.join(__dirname,"views/user"),path.join(__dirname,'views/admin')])
// app.set("views", path.join(__dirname, "views"));





app.use("/",userRouter);
//admin router
app.use('/admin',adminRouter);




app.listen(process.env.PORT,()=>{
    console.log('server running')
})

module.exports = app;