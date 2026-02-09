const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الشركة مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الشركة يجب أن يكون أقل من 100 حرف']
  },
  description: {
    type: String,
    required: [true, 'وصف الشركة مطلوب'],
    maxlength: [1000, 'الوصف يجب أن يكون أقل من 1000 حرف']
  },
  logo: {
    type: String,
    default: null
  },
  website: {
    type: String,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
      'يرجى إدخال رابط صحيح'
    ]
  },
  email: {
    type: String,
    required: [true, 'إيميل الشركة مطلوب'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'يرجى إدخال إيميل صحيح']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10'
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'BLOCKED'],
    default: 'PENDING'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: Get all jobs for this company
companySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'companyId'
});

module.exports = mongoose.model('Company', companySchema);
