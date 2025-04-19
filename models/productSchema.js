const mongoose = require('mongoose')
const{ Schema }= mongoose;


// const productSchema = new Schema({
//     productName:{
//         type:String,
//         required:true,
//     },
//     description:{
//         type:String,
//         required:true,
//     },
//     brand:{
//         type:String,
//         required:true,
//     },
//     category:{
//         type:Schema.Types.ObjectId,
//         ref:"Category",
//         required:true,
//     },
//     regularPrice:{
//         type:Number,
//         required:true,
//     },
//     salePrice:{
//         type:Number,
//         required:true,

//     },
//     productOffer:{
//         type:Number,
//         default:0
//     },
//     quantity:{
//         type:Number,
//         deafault:true
//     },
//     color:{
//         type:String,
//         required:true
//     },
//     productImage:{
//         type:[String],
//         required:true,
//     },
//     isBlocked:{
//         type:Boolean,
//         default:false
//     },
//     status:{
//         type:String,
//         enum:["Available","out of stock",Discountinued],
//         required:true,
//         default:"Available"

//     },
    

// },{timestamps:true});
// const productSchema = new mongoose.Schema({
//   name: 
//   { type: String, 
//     required: true },

//   category: { 
//     type: String, 
//     required: true },

//   subcategory: { 
//     type: String, 
//     required: true },

//   price: { 
//     type: Number, 
//     required: true },

//   images: { 
//     type: [String], 
//     required: true }, // Multiple images

//   isDeleted: { 
//     type: Boolean, 
//     default: false }, // Soft delete flag

//     status: {
//       type: String,
//       enum: ['Active', 'Inactive'],
//       default: 'Active'
//     }
    
    
// }, { timestamps: true });


const productSchema = new mongoose.Schema({
  name:
   { type: String,
     required: true },
  category: 
  { type: String, 
    required: true },
  subcategory: 
  { type: String, 
    required: true },
  price: 
  { type: Number, 
    required: true },
  images: 
  { type: [String],
    //  required: true 
    },
  stock: 
  { type: Number, 
    required: true },
  description: 
  { type: String, 
    required: true },
  isDeleted:
   { type: Boolean,
     default: false },
  isListed: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });



// Method to search products by query string
productSchema.statics.searchProducts = function(query) {
  const filter = {};
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }
  return this.find(filter);
};



const Product = mongoose.model("Product",productSchema)
module.exports = Product;