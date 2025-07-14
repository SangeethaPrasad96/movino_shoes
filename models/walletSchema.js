const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String, // 'credit' or 'debit'
    enum: ['credit', 'debit'],
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [walletTransactionSchema]
});

module.exports = mongoose.model('Wallet', walletSchema);
