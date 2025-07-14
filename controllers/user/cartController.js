const User = require("../../models/userSchema");
const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Wishlist = require("../../models/wishlistSchema");

const loadCartPage = async (req, res) => {
    try {
        const userId = req.session.user._id;

        // Fetch user's cart from the database
        // const cart = await Cart.findOne({ userId }).populate("items.productId").lean();
        // const cart = await Cart.findOne({ userId }).populate("items.productId", "name images").lean();
        const cart = await Cart.findOne({ userId })
    .populate("items.productId", "name images price") // Ensure price is populated
    .lean();
        if (!cart || cart.items.length === 0) {
            return res.render("cart", { user: req.session.user, cartItems: [], totalPrice: 0 });
        }

        // Calculate total price
        const totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

        res.render("cart", {
            user: req.session.user,
            cartItems: cart.items,
            totalPrice,
        });
    } catch (error) {
        console.error("Error loading cart page:", error);
        res.status(500).send("Internal Server Error");
    }
};

// const addToCart = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const productId = req.params.id;

//         const product = await Product.findById(productId);

//         // if (!product || product.isBlocked || product.status !== "listed") {
//         //     return res.status(400).send("Product is unavailable.");
//         // }

//         if (!product || product.isBlocked || product.status !== "Active") {
//             return res.status(400).send("Product is unavailable.");
//         }


//         if (!product || product.isBlocked || product.status !== "Active" || !product.isListed) {
//             return res.status(400).send("Product is unavailable.");
//         }

//         if (!product || product.isBlocked || product.status !== "Active" || !product.isListed || product.isDeleted) {
//             return res.status(400).send("Product is unavailable.");
//         }

//         if (!product || product.isBlocked || product.status !== "Active" || !product.isListed || product.isDeleted || product.stock <= 0) {
//             return res.status(400).send("Product is unavailable.");
//         }


//         let cart = await Cart.findOne({ userId });

//         if (!cart) {
//             cart = new Cart({ userId, items: [] });
//         }

//         const cartItem = cart.items.find((item) => item.productId.toString() === productId);

//         if (cartItem) {
//             // Increment quantity if already in the cart
//             cartItem.quantity += 1;

//             if (cartItem.quantity > product.stock) {
//                 return res.status(400).send("Exceeds stock availability.");
//             }
//         } else {
//             // Add new product to cart
//             cart.items.push({
//                 productId,
//                 quantity: 1,
//                 price: product.price,
//                 totalPrice: product.price,
//             });
//         }

//         // Remove product from wishlist if it exists
//         const user = await User.findById(userId);
//         user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
//         await user.save();

//         await cart.save();
//         res.redirect("/cart");
//     } catch (error) {
//         console.error("Error adding to cart:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };

// const removeFromCart = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const productId = req.params.id;

//         const cart = await Cart.findOne({ userId });

//         if (!cart) {
//             return res.status(404).send("Cart not found.");
//         }

//         cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
//         await cart.save();

//         res.redirect("/cart");
//     } catch (error) {
//         console.error("Error removing from cart:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };



// const addToCart = async (req, res) => {
//   try {
//     const userId = req.session.user._id;
//     const productId = req.params.id;

//     const product = await Product.findById(productId);

//     if (
//       !product ||
//       product.isBlocked ||
//       product.status !== "Active" ||
//       !product.isListed ||
//       product.isDeleted ||
//       product.stock <= 0
//     ) {
//       return res.status(400).send("Product is unavailable.");
//     }

//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({ userId, items: [] });
//     }

//     const cartItem = cart.items.find(
//       (item) => item.productId.toString() === productId
//     );

//     if (cartItem) {
//       cartItem.quantity += 1;
//       if (cartItem.quantity > product.stock) {
//         return res.status(400).send("Exceeds stock availability.");
//       }
//       cartItem.totalPrice = cartItem.quantity * product.price;
//     } else {
//       cart.items.push({
//         productId,
//         quantity: 1,
//         price: product.price,
//         totalPrice: product.price,
//       });
//     }

//     // ✅ Remove from Wishlist if exists
//     await Wishlist.updateOne(
//       { userId },
//       { $pull: { items: { productId: productId } } }
//     );

//     await cart.save();
//     res.redirect("/cart");
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };


const addToCart = async (req, res) => {
    const userId = req.session.user._id;
    const productId = req.params.id;
  
    const product = await Product.findById(productId);
  
    if (!product || product.stock <= 0 || product.isBlocked || !product.isListed || product.isDeleted || product.status !== 'Active') {
      return res.status(400).send('Product is unavailable.');
    }
  
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
  
    const item = cart.items.find(i => i.productId.toString() === productId);
  
    if (item) {
      item.quantity += 1;
      if (item.quantity > product.stock) {
        return res.status(400).send('Exceeds stock availability.');
      }
    } else {
      cart.items.push({ productId, quantity: 1, price: product.price, totalPrice: product.price });
    }
  
    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(i => i.productId.toString() !== productId);
      await wishlist.save();
    }
  
    await cart.save();
    res.redirect('/cart');
  };
  




const removeFromCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.params.id;

        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        // Remove the item
        cart.items = cart.items.filter(item => item.productId._id.toString() !== productId);
        await cart.save();

        // Recalculate the new total
        const updatedTotal = cart.items.reduce((sum, item) => {
            return sum + item.productId.price * item.quantity;
        }, 0);

        // Respond with the new total as JSON
        res.json({ cartTotal: updatedTotal });

    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




// const updateCartQuantity = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const productId = req.params.id;
//         const { change } = req.body;

//         const cart = await Cart.findOne({ userId });

//         if (!cart) {
//             return res.status(404).send("Cart not found.");
//         }

//         const cartItem = cart.items.find((item) => item.productId.toString() === productId);

//         if (!cartItem) {
//             return res.status(404).send("Product not in cart.");
//         }

//         cartItem.quantity += change;

//         if (cartItem.quantity <= 0) {
//             cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
//         } else {
//             const product = await Product.findById(productId);
//             if (cartItem.quantity > product.stock) {
//                 return res.status(400).send("Exceeds stock availability.");
//             }
//             cartItem.totalPrice = cartItem.quantity * product.price;
//         }

//         await cart.save();
//         res.sendStatus(200);
//     } catch (error) {
//         console.error("Error updating cart quantity:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };


const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.params.id;
        const { change } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).send("Cart not found.");

        const cartItem = cart.items.find(item => item.productId.toString() === productId);
        if (!cartItem) return res.status(404).send("Product not in cart.");

        cartItem.quantity += change;

        if (cartItem.quantity <= 0) {
            cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        } else {
            const product = await Product.findById(productId);
            if (cartItem.quantity > product.stock) {
                return res.status(400).send("Exceeds stock availability.");
            }
            cartItem.totalPrice = cartItem.quantity * product.price;
        }

        await cart.save();

        const updatedCart = await Cart.findOne({ userId }).lean();
        const cartTotal = updatedCart.items.reduce((sum, i) => sum + i.totalPrice, 0);

        res.json({
            newQuantity: cartItem.quantity,
            newTotalPrice: cartItem.totalPrice,
            cartTotal
        });
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        res.status(500).send("Internal Server Error");
    }
};

// wishlist

// cartController.js





module.exports = {
    loadCartPage,
    addToCart,
    removeFromCart,
    updateCartQuantity,
};
