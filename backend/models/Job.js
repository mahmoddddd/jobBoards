const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان الوظيفة مطلوب'],
    trim: true,
    maxlength: [100, 'العنوان يجب أن يكون أقل من 100 حرف']
  },
  description: {
    type: String,
    required: [true, 'وصف الوظيفة مطلوب'],
    maxlength: [5000, 'الوصف يجب أن يكون أقل من 5000 حرف']
  },
  requirements: {
    type: String,
    maxlength: [2000, 'المتطلبات يجب أن تكون أقل من 2000 حرف']
  },
  location: {
    type: String,
    required: [true, 'موقع العمل مطلوب'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP'],
    default: 'FULL_TIME'
  },
  experienceLevel: {
    type: String,
    enum: ['ENTRY', 'MID', 'SENIOR', 'LEAD'],
    default: 'ENTRY'
  },
  salaryMin: {
    type: Number,
    default: null
  },
  salaryMax: {
    type: Number,
    default: null
  },
  salaryCurrency: {
    type: String,
    default: 'EGP'
  },
  skills: [{
    type: String,
    trim: true
  }],
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CLOSED'],
    default: 'PENDING'
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search
jobSchema.index({ title: 'text', description: 'text', location: 'text' });

// Virtual: Get applications for this job
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId'
});

module.exports = mongoose.model('Job', jobSchema);
