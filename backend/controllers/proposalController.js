const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
// const Notification = require('../models/Notification'); // specific Notification model not needed if using utility, but kept if used elsewhere.
// actually I'll remove it if unused.
const { sendToUser } = require('../config/socket');
const { createNotification } = require('../utils/notification');

// @desc    Submit a proposal
// @route   POST /api/proposals
// @access  Private (Freelancer)
exports.submitProposal = async (req, res) => {
  try {
    const { projectId, coverLetter, bidAmount, estimatedDuration, attachments } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    }
    if (project.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'المشروع غير مفتوح للعروض' });
    }
    if (project.clientId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'لا يمكنك تقديم عرض على مشروعك' });
    }

    // Check for existing proposal
    const existing = await Proposal.findOne({ projectId, freelancerId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'لقد قدمت عرضاً على هذا المشروع مسبقاً' });
    }

    const proposal = await Proposal.create({
      projectId,
      freelancerId: req.user.id,
      coverLetter,
      bidAmount,
      estimatedDuration,
      attachments
    });

    // Notify project owner
    // Notify project owner
    try {
      await createNotification(
        project.clientId,
        'PROPOSAL_RECEIVED',
        'عرض جديد على مشروعك',
        `تم تقديم عرض جديد على مشروع "${project.title}"`,
        `/projects/${project._id}`
      );

      // Optional: keep sending specific socket event if frontend relies on it for real-time list update
      sendToUser(project.clientId.toString(), 'new-proposal', {
        freelancerName: req.user.name,
        projectTitle: project.title,
        bidAmount
      });
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'تم تقديم عرضك بنجاح',
      proposal
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'لقد قدمت عرضاً مسبقاً' });
    }
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Get proposals for a project (Client)
// @route   GET /api/proposals/project/:projectId
// @access  Private (Project Owner)
exports.getProjectProposals = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    }
    if (project.clientId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    const proposals = await Proposal.find({ projectId: req.params.projectId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: proposals.length, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Get my proposals (Freelancer)
// @route   GET /api/proposals/my-proposals
// @access  Private
exports.getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancerId: req.user.id })
      .populate({
        path: 'projectId',
        select: 'title budgetMin budgetMax budgetType status category',
        populate: { path: 'clientId', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: proposals.length, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Update proposal status (Accept/Reject)
// @route   PUT /api/proposals/:id/status
// @access  Private (Project Owner)
exports.updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate('projectId');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'العرض غير موجود' });
    }

    if (proposal.projectId.clientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    proposal.status = status;
    await proposal.save();

    // If accepted, update project status and assign freelancer
    if (status === 'ACCEPTED') {
      await Project.findByIdAndUpdate(proposal.projectId._id, {
        status: 'IN_PROGRESS',
        assignedTo: proposal.freelancerId
      });

      // Reject all other pending proposals
      await Proposal.updateMany(
        { projectId: proposal.projectId._id, _id: { $ne: proposal._id }, status: 'PENDING' },
        { status: 'REJECTED' }
      );
    }

    // Notify freelancer
    const statusType = status === 'ACCEPTED' ? 'PROPOSAL_ACCEPTED' : 'PROPOSAL_REJECTED';
    const statusText = status === 'ACCEPTED' ? 'تم قبول' : 'تم رفض';

    await createNotification(
      proposal.freelancerId,
      statusType,
      `${statusText} عرضك`,
      `${statusText} عرضك على مشروع "${proposal.projectId.title}"`,
      `/projects/${proposal.projectId._id}`
    );

    res.json({
      success: true,
      message: `تم ${status === 'ACCEPTED' ? 'قبول' : 'رفض'} العرض`,
      proposal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Withdraw a proposal (Freelancer)
// @route   DELETE /api/proposals/:id
// @access  Private
exports.withdrawProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'العرض غير موجود' });
    }
    if (proposal.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }
    if (proposal.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'لا يمكن سحب عرض تمت مراجعته' });
    }

    await proposal.deleteOne();
    res.json({ success: true, message: 'تم سحب العرض' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};
