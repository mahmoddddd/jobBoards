const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cvUrl: {
    type: String,
    required: [true, 'السيرة الذاتية مطلوبة']
  },
  cvPublicId: {
    type: String // Cloudinary public_id for deletion
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'رسالة التغطية يجب أن تكون أقل من 1000 حرف']
  },
  status: {
    type: String,
    enum: ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  notes: {
    type: String, // Company notes on application
    maxlength: [500, 'الملاحظات يجب أن تكون أقل من 500 حرف']
  }
}, {
  timestamps: true
});

// Compound unique index: prevent duplicate applications
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

// Update job application count after save
applicationSchema.post('save', async function() {
  const Job = mongoose.model('Job');
  const count = await this.constructor.countDocuments({ jobId: this.jobId });
  await Job.findByIdAndUpdate(this.jobId, { applicationCount: count });
});

// Update job application count after delete
applicationSchema.post('remove', async function() {
  const Job = mongoose.model('Job');
  const count = await this.constructor.countDocuments({ jobId: this.jobId });
  await Job.findByIdAndUpdate(this.jobId, { applicationCount: count });
});

module.exports = mongoose.model('Application', applicationSchema);
