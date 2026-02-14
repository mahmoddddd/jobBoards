const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'EARNING', 'REFUND'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  description: {
    type: String
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId, // Can be Contract ID, Job ID, or external payment ID
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Contract', 'Job', 'Proposal', null]
  },
  paymentMethod: {
    type: String, // e.g., 'STRIPE', 'PAYPAL', 'BANK_TRANSFER'
    default: null
  },
  transactionId: {
    type: String // External transaction ID (from Stripe/PayPal)
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
