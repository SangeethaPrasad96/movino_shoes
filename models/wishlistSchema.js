const mongoose = require('monngoose')
const {Schema} = mongoose;

const wishListSchema = new Schema ({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    products:[{
        productId:{
            type:Schema.Types.ObjectId,
            ref:"Product",
            required:true,

        },
        addedOn:{
            type:Date,
            default:Date.now
        }
    }]
})

const wishList = mongoose.model("Wishlist",wishlistSchema);
module.exports = Wishlist;
