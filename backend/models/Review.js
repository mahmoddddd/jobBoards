const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Target of the review (Company OR Freelancer)
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Reviewer
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Context (for freelancers)
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },

  rating: {
    type: Number,
    required: [true, 'التقييم مطلوب'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'التعليق مطلوب'],
    maxlength: 1000
  },
  pros: String, // Kept for backward compat with company reviews
  cons: String, // Kept for backward compat with company reviews
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure either companyId or freelancerId is present, but not both (conceptually)
// Validator could be added, but logic in controller is usually enough.

// Indexes
reviewSchema.index({ companyId: 1, userId: 1 }, { unique: true, partialFilterExpression: { companyId: { $exists: true } } });
reviewSchema.index({ contractId: 1, userId: 1 }, { unique: true, partialFilterExpression: { contractId: { $exists: true } } });
reviewSchema.index({ freelancerId: 1 });

// Static method to calculate avg rating for Company
reviewSchema.statics.getCompanyAverage = async function(companyId) {
  const result = await this.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    { $group: { _id: '$companyId', avgAttributes: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  return result[0] || { avgAttributes: 0, count: 0 };
};

// Static method to calculate avg rating for Freelancer
reviewSchema.statics.getFreelancerAverage = async function(freelancerId) {
  const result = await this.aggregate([
    { $match: { freelancerId: new mongoose.Types.ObjectId(freelancerId) } },
    { $group: { _id: '$freelancerId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  return result[0] || { avgRating: 0, count: 0 };
};

// Post-save hook to update aggregates
reviewSchema.post('save', async function() {
  if (this.companyId) {
    // Update Company aggregation (if Company model supports it)
    // For now assuming existing logic handles this or will be updated
  }

  if (this.freelancerId) {
    const stats = await this.constructor.getFreelancerAverage(this.freelancerId);
    await mongoose.model('FreelancerProfile').findOneAndUpdate(
      { userId: this.freelancerId },
      {
        rating: Math.round(stats.avgRating * 10) / 10,
        reviewCount: stats.count
      }
    );
  }
});

module.exports = mongoose.model('Review', reviewSchema);
