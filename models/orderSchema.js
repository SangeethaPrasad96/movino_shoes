// const mongoose = require('mongoose')
// const {Schema} = mongoose;
// const {v4:uuidv4} =require('uuid');//random id given using module

// const orderSchema = new Schema({
//     orderId:{
//         type:String,
//         default:()=>uuidv4(),
//         unique:true
//     },
//     orderItems:[{
//          product:{
//             type:Schema.Types.ObjectId,
//             ref:"Product",
//             required:true
//          },
//          quantity:{
//             type:Number,
//             required:true
//          },
//          price:{
//             type:Number,
//             default:0
//          },
//          totalPrice:{
//             type:Number,
//             required:true,
//          },
//          discount:{
//             type:Number,
//             default:0
//          },
//          finalAmount:{
//             type:Number,
//             required:true
//          },
//          address:{
//             type:Schema.Types.ObjectId,
//             ref:'User',
//             required:true
//          },
//          invoiceDate:{
//             type:Date,
           
//          },
//          status:{
//             type:String,
//             required:true,
//             enum:['Pending','Processing','Shipped','Delivered','Cancelled','Return Request','Returned'],
//          },
       
//          createdOn:{
//             type:Date,
//             default:Date.now,
//             required:true
//          },
//          couponApplied:{
//             type:Boolean,
//             default:false
//          }
//     }],
//     createdAt: {       // ⬅️ Add this
//       type: Date,
//       default: Date.now
//     }


// })

// const Order = mongoose.model("Order",orderSchema)
// module.exports = Order;

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Request', 'Returned']
  },
  couponApplied: {
    type: Boolean,
    default: false
  }
});


const orderSchema = new Schema({
   orderId: {
     type: String,
     default: () => uuidv4(),
     unique: true
   },
   user: {
     type: Schema.Types.ObjectId,
     ref: 'User',
     required: true
   },
   paymentMethod: {
     type: String,
     enum: ['COD', 'Razorpay', 'Wallet'],
     default: 'COD'
   },
   orderItems: [{
     product: {
       type: Schema.Types.ObjectId,
       ref: "Product",
       required: true
     },
     quantity: {
       type: Number,
       required: true
     },
     price: {
       type: Number,
       default: 0
     },
     totalPrice: {
       type: Number,
       required: true
     },
     discount: {
       type: Number,
       default: 0
     },
     finalAmount: {
       type: Number,
       required: true
     },
     address: {
       type: Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     invoiceDate: {
       type: Date
     },
     status: {
       type: String,
       required: true,
      //  enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Request', 'Returned','Return Approved', 'Return Rejected']
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Request', 'Returned', 'Refunded']
     },
     createdOn: {
       type: Date,
       default: Date.now,
       required: true
     },
     couponApplied: {
       type: Boolean,
       default: false
     },
     cancellationReason: {
      type: String,
      default: 'none'
    },
    returnRequest: {
      reason: String,
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
      },
      requestedAt: Date,
      verifiedAt: Date,
    }
   }],
   createdAt: {
     type: Date,
     default: Date.now
   },

  
  
   
 });
 

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
