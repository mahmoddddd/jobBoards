const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000 },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REVISION_REQUESTED', 'PAID'],
    default: 'PENDING'
  },
  deliverables: [{ name: String, url: String }],
  submittedAt: Date,
  approvedAt: Date
}, { _id: true, timestamps: true });

const contractSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  milestones: [milestoneSchema],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

contractSchema.virtual('progress').get(function () {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const completed = this.milestones.filter(m => ['APPROVED', 'PAID'].includes(m.status)).length;
  return Math.round((completed / this.milestones.length) * 100);
});

contractSchema.index({ clientId: 1 });
contractSchema.index({ freelancerId: 1 });
contractSchema.index({ status: 1 });

module.exports = mongoose.model('Contract', contractSchema);
