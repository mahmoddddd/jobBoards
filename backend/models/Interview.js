const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  type: {
    type: String,
    enum: ['VIDEO', 'PHONE', 'IN_PERSON'],
    default: 'VIDEO'
  },
  date: {
    type: Date,
    required: [true, 'Interview date is required']
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  location: {
    type: String, // Zoom link or physical address
    trim: true
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
    default: 'SCHEDULED'
  },
  notes: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
interviewSchema.index({ companyId: 1, date: 1 });
interviewSchema.index({ applicantId: 1, date: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
