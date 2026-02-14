const Dispute = require('../models/Dispute');
const Contract = require('../models/Contract');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { createNotification } = require('./notificationController');

// @desc    Create new dispute
// @route   POST /api/disputes
// @access  Private
exports.createDispute = catchAsync(async (req, res, next) => {
  const { contractId, reason, evidence } = req.body;

  const contract = await Contract.findById(contractId);
  if (!contract) return next(new AppError('Contract not found', 404));

  // Check if user is part of the contract
  const isClient = contract.clientId.toString() === req.user.id;
  const isFreelancer = contract.freelancerId.toString() === req.user.id;

  if (!isClient && !isFreelancer) {
    return next(new AppError('You are not authorized to open a dispute for this contract', 403));
  }

  // Check if already disputed
  const existingDispute = await Dispute.findOne({ contractId, status: { $in: ['OPEN', 'UNDER_REVIEW'] } });
  if (existingDispute) {
    return next(new AppError('A dispute is already open for this contract', 400));
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
  await createNotification({
    recipient: defendantId,
    sender: req.user.id,
    type: 'DISPUTE_OPENED',
    title: 'نشر نزاع جديد',
    message: `لقد قام الطرف الآخر بفتح نزاع بخصوص العقد: ${contract.title}`,
    link: `/contracts/${contractId}/dispute`
  });

  res.status(201).json({
    status: 'success',
    data: {
      dispute
    }
  });
});

// @desc    Get dispute by ID
// @route   GET /api/disputes/:id
// @access  Private
exports.getDispute = catchAsync(async (req, res, next) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('initiatorId', 'name avatar')
    .populate('defendantId', 'name avatar')
    .populate('contractId', 'title totalAmount');

  if (!dispute) return next(new AppError('Dispute not found', 404));

  // Authorization: initiator, defendant, or admin
  const isAuthorized =
    dispute.initiatorId._id.toString() === req.user.id ||
    dispute.defendantId._id.toString() === req.user.id ||
    req.user.role === 'ADMIN';

  if (!isAuthorized) {
    return next(new AppError('You are not authorized to view this dispute', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      dispute
    }
  });
});

// @desc    Add message to dispute
// @route   POST /api/disputes/:id/messages
// @access  Private
exports.addMessage = catchAsync(async (req, res, next) => {
  const { message, attachments } = req.body;
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) return next(new AppError('Dispute not found', 404));
  if (dispute.status === 'RESOLVED' || dispute.status === 'REJECTED') {
    return next(new AppError('This dispute is closed', 400));
  }

  // Authorization check
  const isAuthorized =
    dispute.initiatorId.toString() === req.user.id ||
    dispute.defendantId.toString() === req.user.id ||
    req.user.role === 'ADMIN';

  if (!isAuthorized) {
    return next(new AppError('Unauthorized', 403));
  }

  dispute.messages.push({
    senderId: req.user.id,
    message,
    attachments
  });

  await dispute.save();

  res.status(200).json({
    status: 'success',
    data: {
      messages: dispute.messages
    }
  });
});

// @desc    Resolve dispute (Admin only)
// @route   PATCH /api/disputes/:id/resolve
// @access  Private (Admin)
exports.resolveDispute = catchAsync(async (req, res, next) => {
  const { decision, resultStatus } = req.body; // resultStatus: RESOLVED or REJECTED

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) return next(new AppError('Dispute not found', 404));

  dispute.status = resultStatus;
  dispute.finalDecision = {
    decision,
    decidedBy: req.user.id,
    decidedAt: Date.now()
  };

  await dispute.save();

  // Update contract status if needed (e.g., if resolved, maybe it back to ACTIVE or stay COMPLETED)
  const contract = await Contract.findById(dispute.contractId);
  if (resultStatus === 'RESOLVED') {
      // Logic for resolution (e.g. manual payment or cancellation)
  }

  res.status(200).json({
    status: 'success',
    data: {
      dispute
    }
  });
});

// @desc    Get my disputes
// @route   GET /api/disputes/my
// @access  Private
exports.getMyDisputes = catchAsync(async (req, res, next) => {
  const disputes = await Dispute.find({
    $or: [{ initiatorId: req.user.id }, { defendantId: req.user.id }]
  }).sort('-createdAt').populate('contractId', 'title');

  res.status(200).json({
    status: 'success',
    results: disputes.length,
    data: {
      disputes
    }
  });
});
