const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number, // Index of the correct option (0-3)
    required: true,
    select: false // Don't send to frontend by default
  }
});

const skillTestSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  questions: [questionSchema],
  passingScore: {
    type: Number,
    default: 70
  },
  durationMinutes: {
    type: Number,
    default: 15
  },
  icon: {
    type: String // Lucide icon name or URL
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SkillTest', skillTestSchema);
