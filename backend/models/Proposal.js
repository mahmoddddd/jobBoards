const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'رسالة التقديم مطلوبة'],
    trim: true,
    maxlength: [3000, 'الرسالة يجب أن تكون أقل من 3000 حرف']
  },
  bidAmount: {
    type: Number,
    required: [true, 'قيمة العرض مطلوبة'],
    min: [1, 'القيمة يجب أن تكون أكبر من 0']
  },
  estimatedDuration: {
    type: String,
    enum: ['LESS_THAN_1_WEEK', 'LESS_THAN_1_MONTH', '1_TO_3_MONTHS', '3_TO_6_MONTHS', 'MORE_THAN_6_MONTHS'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
    default: 'PENDING'
  },
  attachments: [{
    name: String,
    url: String
  }]
}, {
  timestamps: true
});

// Unique: one proposal per freelancer per project
proposalSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });

// Update project proposal count
proposalSchema.post('save', async function () {
  const Project = mongoose.model('Project');
  const count = await this.constructor.countDocuments({ projectId: this.projectId });
  await Project.findByIdAndUpdate(this.projectId, { proposalCount: count });
});

proposalSchema.post('deleteOne', { document: true, query: true }, async function () {
  const Project = mongoose.model('Project');
  const count = await mongoose.model('Proposal').countDocuments({ projectId: this.projectId });
  await Project.findByIdAndUpdate(this.projectId, { proposalCount: count });
});

module.exports = mongoose.model('Proposal', proposalSchema);
