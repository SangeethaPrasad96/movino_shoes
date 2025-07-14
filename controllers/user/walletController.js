const Wallet = require('../../models/walletSchema');

const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.session.userId });
    res.render('user/wallet', { wallet });
  } catch (err) {
    console.error("Wallet error:", err);
    res.status(500).send("Error loading wallet");
  }
};

module.exports = {
  getWallet
};
