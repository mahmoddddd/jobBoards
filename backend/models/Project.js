const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان المشروع مطلوب'],
    trim: true,
    maxlength: [150, 'العنوان يجب أن يكون أقل من 150 حرف']
  },
  description: {
    type: String,
    required: [true, 'وصف المشروع مطلوب'],
    trim: true,
    maxlength: [5000, 'الوصف يجب أن يكون أقل من 5000 حرف']
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  category: {
    type: String,
    required: [true, 'تصنيف المشروع مطلوب'],
    enum: [
      'WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'DESIGN',
      'WRITING', 'MARKETING', 'DATA_SCIENCE',
      'VIDEO_ANIMATION', 'MUSIC_AUDIO', 'BUSINESS', 'OTHER'
    ]
  },
  skills: [{
    type: String,
    trim: true
  }],
  budgetType: {
    type: String,
    required: true,
    enum: ['FIXED', 'HOURLY'],
    default: 'FIXED'
  },
  budgetMin: {
    type: Number,
    min: [0, 'الميزانية يجب أن تكون أكبر من 0']
  },
  budgetMax: {
    type: Number,
    min: [0, 'الميزانية يجب أن تكون أكبر من 0']
  },
  duration: {
    type: String,
    enum: ['LESS_THAN_1_WEEK', 'LESS_THAN_1_MONTH', '1_TO_3_MONTHS', '3_TO_6_MONTHS', 'MORE_THAN_6_MONTHS'],
    default: 'LESS_THAN_1_MONTH'
  },
  experienceLevel: {
    type: String,
    enum: ['ENTRY', 'MID', 'SENIOR', 'EXPERT'],
    default: 'MID'
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'OPEN'
  },
  attachments: [{
    name: String,
    url: String
  }],
  proposalCount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
projectSchema.index({ clientId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
