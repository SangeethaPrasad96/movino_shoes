const mongoose = require('mongoose')
const {Schema} = mongoose;


const categorySchema = new mongoose.Schema({

    // categoryName:{
        
    //         type:String,
    //         required:true,
    //         unique:true
    //     },
        // description:{
        //     type:String,
        //     required:true,

        // },
        //category wise list and unlist
        // isListed:{
        //     type:Boolean,
        //     default:true

        // },
        // categoryOffer:{
        //     type:Number,
        //     default:0
        // },
//         createdAt:{
//             type:Date,
//             default:Date.now
//         }

//     }
// )
// {
    categoryName: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    image: {
      type: String, // or an array if you want multiple images
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // for createdAt and updatedAt
);

const Category = mongoose.model("Category",categorySchema);
module.exports = Category;