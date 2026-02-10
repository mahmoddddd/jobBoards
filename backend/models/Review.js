const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'التقييم مطلوب'],
    min: [1, 'التقييم يجب أن يكون 1 على الأقل'],
    max: [5, 'التقييم يجب أن يكون 5 كحد أقصى']
  },
  title: {
    type: String,
    required: [true, 'عنوان التقييم مطلوب'],
    trim: true,
    maxlength: [100, 'العنوان يجب أن يكون أقل من 100 حرف']
  },
  comment: {
    type: String,
    required: [true, 'تعليق التقييم مطلوب'],
    maxlength: [1000, 'التعليق يجب أن يكون أقل من 1000 حرف']
  },
  pros: {
    type: String,
    maxlength: [500, 'المميزات يجب أن تكون أقل من 500 حرف']
  },
  cons: {
    type: String,
    maxlength: [500, 'العيوب يجب أن تكون أقل من 500 حرف']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews: one review per user per company
reviewSchema.index({ companyId: 1, userId: 1 }, { unique: true });

// Static method to get average rating
reviewSchema.statics.getAverageRating = async function(companyId) {
  const result = await this.aggregate([
    { $match: { companyId: companyId } },
    {
      $group: {
        _id: '$companyId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0
    ? { averageRating: Math.round(result[0].averageRating * 10) / 10, totalReviews: result[0].totalReviews }
    : { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);
