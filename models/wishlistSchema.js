// const mongoose = require('mongoose')
// const {Schema} = mongoose;

// const wishlistSchema = new Schema ({
//     userId:{
//         type:Schema.Types.ObjectId,
//         ref:"User",
//         required:true,
//     },
//     products:[{
//         productId:{
//             type:Schema.Types.ObjectId,
//             ref:"Product",
//             required:true,

//         },
//         addedOn:{
//             type:Date,
//             default:Date.now
//         }
//     }]
// })

// const wishlist = mongoose.model("Wishlist",wishlistSchema);
// module.exports = wishlist;
// // models/Wishlist.js
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    },
  ],
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
