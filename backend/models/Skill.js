const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المهارة مطلوب'],
    unique: true,
    trim: true,
    maxlength: [50, 'اسم المهارة يجب أن يكون أقل من 50 حرف']
  },
  nameAr: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'تصنيف المهارة مطلوب'],
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
  }
}, {
  timestamps: true
});

skillSchema.index({ category: 1 });
skillSchema.index({ name: 'text', nameAr: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
