const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  defendantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'سبب النزاع مطلوب'],
    trim: true,
    maxlength: 2000
  },
  evidence: [{
    name: String,
    url: String
  }],
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
    default: 'OPEN'
  },
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    attachments: [{ name: String, url: String }],
    createdAt: { type: Date, default: Date.now }
  }],
  finalDecision: {
    decision: String,
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decidedAt: Date
  }
}, {
  timestamps: true
});

// Index for quick lookup
disputeSchema.index({ contractId: 1 });
disputeSchema.index({ status: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
