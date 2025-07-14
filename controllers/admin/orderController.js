const Order = require('../../models/orderSchema');
const User = require('../../models/userSchema'); // if needed for user info
const Wallet = require('../../models/walletSchema'); // if you have a wallet model

// 1. List all orders in descending order of creation
// const listOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate('user')
//       .sort({ createdAt: -1 });

//     res.render('admin/orders/list', { orders }); // adjust view path
//   } catch (err) {
//     console.error("Error listing orders:", err);
//     res.status(500).send("Internal Server Error");
//   }
// };
// const listOrders = async (req, res) => {
//     try {
//       const { search = '', status = '', sort = 'desc', page = 1, limit = 5 } = req.query;
  
//       const query = {};
//       if (search) {
//         query.$or = [
//           { orderId: { $regex: search, $options: 'i' } },
//           { 'user.name': { $regex: search, $options: 'i' } }
//         ];
//       }
  
//       if (status) {
//         query['orderItems.status'] = status;
//       }
  
//       const skip = (page - 1) * limit;
  
//       const orders = await Order.find()
//         .populate('user')
//         .sort({ createdAt: sort === 'asc' ? 1 : -1 })
//         .skip(skip)
//         .limit(limit);
  
//       const total = await Order.countDocuments();
  
//       res.render('orders/list', {
//         orders,
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         search,
//         status,
//         sort
//       });
  
//     } catch (err) {
//       console.error("Error listing orders:", err);
//       res.status(500).send("Internal Server Error");
//     }
//   };
  
const listOrders = async (req, res) => {
    try {
      const { search = '', status = '', sort = 'desc', page = 1, limit = 5 } = req.query;
  
      const query = {};
  
      if (search) {
        // Partial match on orderId
        query.orderId = { $regex: search, $options: 'i' };
      }
  
      if (status) {
        query['orderItems.status'] = status;
      }
  
      const skip = (page - 1) * limit;
  
      const orders = await Order.find(query)
        .populate('user')
        .sort({ createdAt: sort === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
  
      const total = await Order.countDocuments(query);
    
      res.render('orders/list', {
        orders,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        search,
        status,
        sort
      });
  
    } catch (err) {
      console.error("Error listing orders:", err);
      res.status(500).send("Internal Server Error");
    }
  };
  




// 2. View order details
const viewOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('user')
      .populate('orderItems.product');

    if (!order) return res.status(404).send("Order not found");

    res.render('orders/detail', { order });
  } catch (err) {
    console.error("Error loading order detail:", err);
    res.status(500).send("Internal Server Error");
  }
};

// 3. Update order status (pending, shipped, delivered, etc.)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) return res.status(404).send("Order not found");

    order.orderItems.forEach(item => {
      item.status = status;
    });

    await order.save();

    res.redirect(`/admin/orders/${order.orderId}`);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).send("Internal Server Error");
  }
};

// 4. Verify return and refund to wallet
// const verifyReturnRequest = async (req, res) => {
//   try {
//     const { orderId, itemId } = req.params;
//     const order = await Order.findOne({ orderId });

//     const item = order.orderItems.id(itemId);
//     if (!item || item.status !== 'Returned') {
//       return res.status(400).send("Invalid return");
//     }

//     // Refund to wallet
//     const userId = order.user;
//     const refundAmount = item.finalAmount;

//     let wallet = await Wallet.findOne({ user: userId });
//     if (!wallet) {
//       wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
//     }

//     wallet.balance += refundAmount;
//     wallet.transactions.push({
//       type: 'credit',
//       amount: refundAmount,
//       reason: 'Refund for returned item',
//       date: new Date()
//     });

//     item.status = 'Refunded';

//     await wallet.save();
//     await order.save();

//     res.redirect(`/admin/orders/${orderId}`);
//   } catch (err) {
//     console.error("Error verifying return:", err);
//     res.status(500).send("Internal Server Error");
//   }
// };
// const verifyReturnRequest = async (req, res) => {
//     try {
//       const { orderId, itemId } = req.params;
  
//       const order = await Order.findOne({ orderId });
//       if (!order) return res.status(404).send("Order not found");
  
//       const item = order.orderItems.id(itemId);
//       if (!item || item.status !== 'Returned') {
//         return res.status(400).send("Invalid return");
//       }
  
//       // Get the user and refund the amount to their wallet
//       const user = await User.findById(order.user);
//       if (!user) return res.status(404).send("User not found");
  
//       const refundAmount = item.finalAmount;
//       user.wallet += refundAmount;
  
//       item.status = 'Refunded';
  
//       await user.save();
//       await order.save();
  
//       res.redirect(`/admin/orders/${orderId}`);
//     } catch (err) {
//       console.error("Error verifying return:", err);
//       res.status(500).send("Internal Server Error");
//     }
//   };
  


const verifyReturnRequest = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    // 1. Find the order
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).send("Order not found");

    // 2. Find the specific item in orderItems array
    const item = order.orderItems.id(itemId);
    if (!item || item.status !== 'Returned') {
      return res.status(400).send("Invalid return request");
    }

    // 3. Refund to Wallet
    const userId = order.user;
    const refundAmount = item.finalAmount;

    // 4. Find or create wallet for the user
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({
        user: userId,
        balance: 0,
        transactions: [],
      });
    }

    // 5. Credit amount & add transaction entry
    wallet.balance += refundAmount;
    wallet.transactions.push({
      amount: refundAmount,
      type: 'credit',
      description: `Refund for returned item in order ${orderId}`,
    });

    // 6. Update item status
    item.status = 'Refunded';

    // 7. Save both
    await wallet.save();
    await order.save();

    res.redirect(`/admin/orders/${orderId}`);
  } catch (err) {
    console.error("Error verifying return:", err);
    res.status(500).send("Internal Server Error");
  }
};




module.exports = {
  listOrders,
  viewOrderDetails,
  updateOrderStatus,
  verifyReturnRequest
};
