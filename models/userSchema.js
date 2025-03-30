const mongoose = require('mongoose')
const{Schema }= mongoose;


const userSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    // phone:{
    //     type:String,
    //     required:false,//single signup time username emailid only
    //     unique:false,
    //     sparse:true, //single sign 
    //     default:null
    // },
    googleId:{
        type: String,
        unique:true,

    },
    password:{
        type:String,
        required:false //single signup time not using password

    },
    isBlocked:{
        type: Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    //multiple pdts so array
    cart:[{
        type:Schema.Types.ObjectId,//cart is the refference to other collection
        ref:"Cart",
    }],
    wallet:{
        type:Number,
        default:0,
    },
    wishlist:[{
        type:Schema.Types.ObjectId,
        ref:"Wishlist"
    }],
    orderHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Order"
    }],
    createdOn:{
        type:Date,
        default:Date.now,
    },
    //referral code to new user
    // referalCode:{
    //     type:String,

    // },
    // redeemed:{
    //     type:Boolean
    
    // },
    // redeemedUsers:[{
    //     type:Schema.Types.ObjectId,
    //     ref:"User"
    // }],
    //after sorting pdt picking//sorting category and brand wise
    searchHistory:[{
        category:{
            type:Schema.Types.ObjectId,
            ref:"Category",
        },
        brand:{
            type: String
        },
        searchOn:{
            type:Date,
            default:Date.now
        }


    }]
})



const User = mongoose.model("User",userSchema);
module.exports = User;