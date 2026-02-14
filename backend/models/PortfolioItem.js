const mongoose = require('mongoose');
const slugify = require('slugify');

const portfolioItemSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'عنوان العمل مطلوب'],
    trim: true,
    maxlength: [100, 'العنوان يجب أن يكون أقل من 100 حرف']
  },
  slug: {
    type: String
  },
  description: {
    type: String,
    required: [true, 'وصف العمل مطلوب'],
    trim: true,
    maxlength: [5000, 'الوصف يجب أن يكون أقل من 5000 حرف']
  },
  coverImage: {
    type: String,
    required: [true, 'صورة الغلاف مطلوبة']
  },
  images: [{
    type: String
  }],
  videoUrl: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  completionDate: {
    type: Date
  },
  skills: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title before saving
portfolioItemSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();

  this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  next();
});

// Indexes
portfolioItemSchema.index({ freelancerId: 1 });
portfolioItemSchema.index({ slug: 1 });
portfolioItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PortfolioItem', portfolioItemSchema);
