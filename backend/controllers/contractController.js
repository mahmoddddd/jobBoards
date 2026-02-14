const Contract = require('../models/Contract');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const FreelancerProfile = require('../models/FreelancerProfile');
// const Notification = require('../models/Notification');
const { sendToUser } = require('../config/socket'); // Keep for potential custom events
const { createNotification } = require('../utils/notification');

// @desc    Create contract (auto from accepted proposal)
// @route   POST /api/contracts
// @access  Private
exports.createContract = async (req, res) => {
  try {
    const { proposalId, milestones } = req.body;

    const proposal = await Proposal.findById(proposalId).populate('projectId');
    if (!proposal) return res.status(404).json({ success: false, message: 'العرض غير موجود' });
    if (proposal.status !== 'ACCEPTED') return res.status(400).json({ success: false, message: 'العرض غير مقبول' });
    if (proposal.projectId.clientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    // Check if contract already exists for this proposal
    const existing = await Contract.findOne({ proposalId });
    if (existing) return res.status(400).json({ success: false, message: 'يوجد عقد بالفعل لهذا العرض' });

    const contract = await Contract.create({
      projectId: proposal.projectId._id,
      proposalId: proposal._id,
      clientId: req.user.id,
      freelancerId: proposal.freelancerId,
      title: proposal.projectId.title,
      totalAmount: proposal.bidAmount,
      milestones: milestones || [{ title: 'تسليم المشروع', amount: proposal.bidAmount, status: 'PENDING' }]
    });

    // Notify freelancer
    // Notify freelancer
    try {
      await createNotification(
        proposal.freelancerId,
        'CONTRACT_CREATED',
        'عقد جديد',
        `تم إنشاء عقد لمشروع "${proposal.projectId.title}"`,
        `/contracts/${contract._id}`
      );
    } catch (e) { console.error('Notification error:', e); }

    res.status(201).json({ success: true, message: 'تم إنشاء العقد بنجاح', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Get my contracts
// @route   GET /api/contracts
// @access  Private
exports.getMyContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      $or: [{ clientId: req.user.id }, { freelancerId: req.user.id }]
    })
      .populate('projectId', 'title category')
      .populate('clientId', 'name')
      .populate('freelancerId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: contracts.length, contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Get single contract
// @route   GET /api/contracts/:id
// @access  Private (Parties only)
exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('projectId', 'title description category')
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email');

    if (!contract) return res.status(404).json({ success: false, message: 'العقد غير موجود' });

    if (contract.clientId._id.toString() !== req.user.id &&
        contract.freelancerId._id.toString() !== req.user.id &&
        req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Add milestone
// @route   POST /api/contracts/:id/milestones
// @access  Private (Client)
exports.addMilestone = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'العقد غير موجود' });
    if (contract.clientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    const { title, description, amount, dueDate } = req.body;
    contract.milestones.push({ title, description, amount, dueDate });
    await contract.save();

    res.json({ success: true, message: 'تمت إضافة المعلم', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Update milestone status
// @route   PUT /api/contracts/:id/milestones/:milestoneId
// @access  Private
exports.updateMilestoneStatus = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'العقد غير موجود' });

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'المعلم غير موجود' });

    const { status, deliverables } = req.body;
    const userId = req.user.id;
    const isClient = contract.clientId.toString() === userId;
    const isFreelancer = contract.freelancerId.toString() === userId;

    // Freelancer: submit milestone
    if (isFreelancer && status === 'SUBMITTED') {
      milestone.status = 'SUBMITTED';
      milestone.submittedAt = new Date();
      if (deliverables) milestone.deliverables = deliverables;

      await createNotification(
        contract.clientId,
        'MILESTONE_SUBMITTED',
        'تم تسليم معلم',
        `قام المستقل بتسليم "${milestone.title}" في مشروع "${contract.title}"`,
        `/contracts/${contract._id}`
      );
    }
    // Client: approve or request revision
    else if (isClient && ['APPROVED', 'REVISION_REQUESTED'].includes(status)) {
      milestone.status = status;
      if (status === 'APPROVED') milestone.approvedAt = new Date();

      await createNotification(
        contract.freelancerId,
        status === 'APPROVED' ? 'MILESTONE_APPROVED' : 'MILESTONE_REJECTED',
        status === 'APPROVED' ? 'تمت الموافقة' : 'مطلوب تعديل',
        `تم ${status === 'APPROVED' ? 'الموافقة على' : 'طلب تعديل'} معلم "${milestone.title}"`,
        `/contracts/${contract._id}`
      );
    }
    // Client: mark as paid
    else if (isClient && status === 'PAID') {
      milestone.status = 'PAID';
      // Update freelancer earnings
      await FreelancerProfile.findOneAndUpdate(
        { userId: contract.freelancerId },
        { $inc: { totalEarnings: milestone.amount } }
      );
    }
    else {
      return res.status(403).json({ success: false, message: 'غير مصرح بهذا الإجراء' });
    }

    await contract.save();

    // Check if all milestones are paid → complete contract
    const allPaid = contract.milestones.every(m => m.status === 'PAID');
    if (allPaid) {
      contract.status = 'COMPLETED';
      contract.endDate = new Date();
      await contract.save();

      // Update project status
      await Project.findByIdAndUpdate(contract.projectId, { status: 'COMPLETED' });

      // Update freelancer completed projects
      await FreelancerProfile.findOneAndUpdate(
        { userId: contract.freelancerId },
        { $inc: { completedProjects: 1 } }
      );

      // Notify both parties
      await createNotification(
        contract.clientId,
        'CONTRACT_COMPLETED',
        'اكتمل المشروع',
        `اكتمل المشروع "${contract.title}" بنجاح`,
        `/contracts/${contract._id}`
      );
      await createNotification(
        contract.freelancerId,
        'CONTRACT_COMPLETED',
        'اكتمل المشروع',
        `تهانينا! اكتمل المشروع "${contract.title}" بنجاح`,
        `/contracts/${contract._id}`
      );
    }

    res.json({ success: true, message: 'تم تحديث المعلم', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};
