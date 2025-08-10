
const User = require("../../models/userSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Wishlist = require("../../models/wishlistSchema");


const viewWishlist = async (req, res) => {
  const userId = req.session.user._id;
  const wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
  res.render('wishlist', { wishlist,user: req.session.user ,    error: req.query.error  });
// res.render("/wishlist");

};

// const addToWishlist = async (req, res) => {
 


//   if (!req.session.user || !req.session.user._id) {
//     return res.status(401).json({ success: false, message: 'User not logged in' });
//   }
//   const userId = req.session.user._id;
//   const productId = req.params.id;

//   let wishlist = await Wishlist.findOne({ userId });

//   if (!wishlist) {
//     wishlist = new Wishlist({ userId, items: [{ productId }] });
//   } else {
//     const exists = wishlist.items.find(item => item.productId.toString() === productId);
//     if (!exists) wishlist.items.push({ productId });
//   }

//   await wishlist.save();
//   res.redirect('/shop');
// };

const addToWishlist = async (req, res) => {
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ success: false, message: 'User not logged in' });
  }

  const userId = req.session.user._id;
  const productId = req.params.id;

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = new Wishlist({ userId, items: [{ productId }] });
    await wishlist.save();
    return res.redirect('/shop?wishlist=added');
  } else {
    const exists = wishlist.items.find(item => item.productId.toString() === productId);
    if (!exists) {
      wishlist.items.push({ productId });
      await wishlist.save();
      return res.redirect('/shop?wishlist=added');
    } else {
      return res.redirect('/shop?wishlist=exists');
    }
  }
};





const removeFromWishlist = async (req, res) => {
  const userId = req.session.user._id;
  const productId = req.params.id;

  await Wishlist.updateOne(
    { userId },
    { $pull: { items: { productId } } }
  );

  res.redirect('/wishlist?removed=true');
};

module.exports = {
  viewWishlist,
  addToWishlist,
  removeFromWishlist
};