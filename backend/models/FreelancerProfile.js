const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  imageUrl: {
    type: String
  },
  link: {
    type: String,
    trim: true
  }
}, { _id: true });

const freelancerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'العنوان المهني مطلوب'],
    trim: true,
    maxlength: [100, 'العنوان يجب أن يكون أقل من 100 حرف']
  },
  bio: {
    type: String,
    required: [true, 'النبذة مطلوبة'],
    trim: true,
    maxlength: [2000, 'النبذة يجب أن تكون أقل من 2000 حرف']
  },
  skills: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'التصنيف مطلوب'],
    enum: [
      'WEB_DEVELOPMENT',
      'MOBILE_DEVELOPMENT',
      'DESIGN',
      'WRITING',
      'MARKETING',
      'DATA_SCIENCE',
      'VIDEO_ANIMATION',
      'MUSIC_AUDIO',
      'BUSINESS',
      'OTHER'
    ]
  },
  hourlyRate: {
    type: Number,
    min: [1, 'السعر يجب أن يكون أكبر من 0'],
    max: [1000, 'السعر يجب أن يكون أقل من 1000']
  },
  availability: {
    type: String,
    enum: ['AVAILABLE', 'BUSY', 'NOT_AVAILABLE'],
    default: 'AVAILABLE'
  },
  experienceLevel: {
    type: String,
    enum: ['ENTRY', 'MID', 'SENIOR', 'EXPERT'],
    default: 'MID'
  },
  portfolio: [portfolioItemSchema],
  languages: [{
    language: { type: String, trim: true },
    level: {
      type: String,
      enum: ['BASIC', 'CONVERSATIONAL', 'FLUENT', 'NATIVE']
    }
  }],
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for search
freelancerProfileSchema.index({ skills: 1 });
freelancerProfileSchema.index({ category: 1 });
freelancerProfileSchema.index({ hourlyRate: 1 });
freelancerProfileSchema.index({ rating: -1 });
freelancerProfileSchema.index({ availability: 1 });
freelancerProfileSchema.index({ title: 'text', bio: 'text' });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
