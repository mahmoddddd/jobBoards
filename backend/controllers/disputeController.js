const Dispute = require('../models/Dispute');
const Contract = require('../models/Contract');
const { createNotification } = require('../utils/notification');

// @desc    Create new dispute
// @route   POST /api/disputes
// @access  Private
exports.createDispute = async (req, res) => {
  try {
    const { contractId, reason, evidence } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Check if user is part of the contract
    const isClient = contract.clientId.toString() === req.user.id;
    const isFreelancer = contract.freelancerId.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'You are not authorized to open a dispute for this contract' });
    }

    // Check if already disputed
    const existingDispute = await Dispute.findOne({ contractId, status: { $in: ['OPEN', 'UNDER_REVIEW'] } });
    if (existingDispute) {
      return res.status(400).json({ success: false, message: 'A dispute is already open for this contract' });
    }

    const defendantId = isClient ? contract.freelancerId : contract.clientId;

    const dispute = await Dispute.create({
      contractId,
      initiatorId: req.user.id,
      defendantId,
      reason,
      evidence
    });

    // Update contract status
    contract.status = 'DISPUTED';
    await contract.save();

    // Notify defendant
    await createNotification(
      defendantId,
      'DISPUTE_OPENED',
      'نشر نزاع جديد',
      `لقد قام الطرف الآخر بفتح نزاع بخصوص العقد: ${contract.title}`,
      `/disputes/${dispute._id}`
    );

    res.status(201).json({
      success: true,
      data: {
        dispute
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dispute by ID
// @route   GET /api/disputes/:id
// @access  Private
exports.getDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('initiatorId', 'name avatar')
      .populate('defendantId', 'name avatar')
      .populate('contractId', 'title totalAmount');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    // Authorization: initiator, defendant, or admin
    const isAuthorized =
      dispute.initiatorId._id.toString() === req.user.id ||
      dispute.defendantId._id.toString() === req.user.id ||
      req.user.role === 'ADMIN';

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this dispute' });
    }

    res.status(200).json({
      success: true,
      data: {
        dispute
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add message to dispute
// @route   POST /api/disputes/:id/messages
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { message, attachments } = req.body;
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }
    if (dispute.status === 'RESOLVED' || dispute.status === 'REJECTED') {
      return res.status(400).json({ success: false, message: 'This dispute is closed' });
    }

    // Authorization check
    const isAuthorized =
      dispute.initiatorId.toString() === req.user.id ||
      dispute.defendantId.toString() === req.user.id ||
      req.user.role === 'ADMIN';

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    dispute.messages.push({
      senderId: req.user.id,
      message,
      attachments
    });

    await dispute.save();

    res.status(200).json({
      success: true,
      data: {
        messages: dispute.messages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve dispute (Admin only)
// @route   PATCH /api/disputes/:id/resolve
// @access  Private (Admin)
exports.resolveDispute = async (req, res) => {
  try {
    const { decision, resultStatus } = req.body; // resultStatus: RESOLVED or REJECTED

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    dispute.status = resultStatus;
    dispute.finalDecision = {
      decision,
      decidedBy: req.user.id,
      decidedAt: Date.now()
    };

    await dispute.save();

    // Update contract status if needed (e.g., if resolved, maybe it back to ACTIVE or stay COMPLETED)
    // const contract = await Contract.findById(dispute.contractId);

    res.status(200).json({
      success: true,
      data: {
        dispute
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my disputes
// @route   GET /api/disputes/my
// @access  Private
exports.getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ initiatorId: req.user.id }, { defendantId: req.user.id }]
    }).sort('-createdAt').populate('contractId', 'title');

    res.status(200).json({
      success: true,
      results: disputes.length,
      data: {
        disputes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
