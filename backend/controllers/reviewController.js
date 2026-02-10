const Review = require('../models/Review');
const Company = require('../models/Company');

// @desc    Get reviews for a company
// @route   GET /api/reviews/company/:companyId
// @access  Public
exports.getCompanyReviews = async (req, res) => {
  try {
    const { companyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ companyId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ companyId });
    const stats = await Review.getAverageRating(require('mongoose').Types.ObjectId.createFromHexString(companyId));

    // Rating distribution
    const distribution = await Review.aggregate([
      { $match: { companyId: require('mongoose').Types.ObjectId.createFromHexString(companyId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      const found = distribution.find(d => d._id === i);
      ratingDistribution[i] = found ? found.count : 0;
    }

    res.json({
      success: true,
      reviews,
      stats: {
        ...stats,
        ratingDistribution
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (USER only)
exports.createReview = async (req, res) => {
  try {
    const { companyId, rating, title, comment, pros, cons, isAnonymous } = req.body;

    // Check company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'الشركة غير موجودة' });
    }

    // Check if user already reviewed this company
    const existingReview = await Review.findOne({ companyId, userId: req.user._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'لقد قمت بتقييم هذه الشركة مسبقاً' });
    }

    const review = await Review.create({
      companyId,
      userId: req.user._id,
      rating,
      title,
      comment,
      pros,
      cons,
      isAnonymous
    });

    await review.populate('userId', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'تم إضافة التقييم بنجاح',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'لقد قمت بتقييم هذه الشركة مسبقاً' });
    }
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner)
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'التقييم غير موجود' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بتعديل هذا التقييم' });
    }

    const { rating, title, comment, pros, cons, isAnonymous } = req.body;
    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, title, comment, pros, cons, isAnonymous },
      { new: true, runValidators: true }
    ).populate('userId', 'name avatar');

    res.json({ success: true, message: 'تم تحديث التقييم', review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'التقييم غير موجود' });
    }

    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بحذف هذا التقييم' });
    }

    await review.deleteOne();

    res.json({ success: true, message: 'تم حذف التقييم' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};
