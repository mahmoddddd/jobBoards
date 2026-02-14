const Review = require('../models/Review');
const Company = require('../models/Company');
const Contract = require('../models/Contract');
const FreelancerProfile = require('../models/FreelancerProfile');

// @desc    Get reviews for a company
// @route   GET /api/reviews/company/:companyId
// @access  Public
exports.getCompanyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ companyId: req.params.companyId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get reviews for a freelancer
// @route   GET /api/reviews/freelancer/:freelancerId
// @access  Public
exports.getFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ freelancerId: req.params.freelancerId })
      .populate('userId', 'name avatar') // Reviewer info
      .populate('contractId', 'title')   // Project context
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a review (Company or Freelancer)
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const {
      companyId, freelancerId, contractId, // Targets
      rating, title, comment, pros, cons, isAnonymous
    } = req.body;

    const reviewData = {
      userId: req.user.id,
      rating, title, comment, pros, cons, isAnonymous
    };

    // Case 1: Freelancer Review (Contract-based)
    if (contractId && freelancerId) {
        // Verify contract
        const contract = await Contract.findById(contractId);
        if (!contract) return res.status(404).json({ success: false, message: 'العقد غير موجود' });

        // Ensure reviewer is the client
        if (contract.clientId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'غير مصرح لك بتقييم هذا العقد' });
        }
        // Ensure contract is completed
        if (contract.status !== 'COMPLETED') {
            return res.status(400).json({ success: false, message: 'يجب أن يكون العقد مكتملاً للتقييم' });
        }

        reviewData.freelancerId = freelancerId;
        reviewData.contractId = contractId;
    }
    // Case 2: Company Review (Legacy/Existing)
    else if (companyId) {
        reviewData.companyId = companyId;
    }
    else {
        return res.status(400).json({ success: false, message: 'وجهة التقييم غير محددة' });
    }

    const review = await Review.create(reviewData);

    res.status(201).json({
      success: true,
      message: 'تم إضافة التقييم بنجاح',
      review
    });
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'لقد قمت بتقييم هذا العنصر مسبقاً' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'التقييم غير موجود' });

    if (review.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Trigger save to re-calculate averages
    await review.save();

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'التقييم غير موجود' });

    if (review.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    await review.deleteOne(); // Will trigger potential cleanup/re-calc if hooks set on remove

    // Manually trigger re-calc if needed (Mongoose middleware for 'deleteOne' on doc is tricky sometimes)
    if (review.freelancerId) {
         const stats = await Review.getFreelancerAverage(review.freelancerId);
         await FreelancerProfile.findOneAndUpdate(
           { userId: review.freelancerId },
           { rating: Math.round(stats.avgRating * 10) / 10, reviewCount: stats.count }
         );
    }

    res.json({ success: true, message: 'تم حذف التقييم' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
