const PortfolioItem = require('../models/PortfolioItem');
const FreelancerProfile = require('../models/FreelancerProfile');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all portfolio items for a freelancer
exports.getFreelancerPortfolio = catchAsync(async (req, res, next) => {
  const { freelancerId } = req.params;

  const items = await PortfolioItem.find({ freelancerId }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: items.length,
    data: {
      items
    }
  });
});

// Get single portfolio item by slug
exports.getPortfolioItem = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const item = await PortfolioItem.findOne({ slug }).populate('freelancerId', 'name avatar');

  if (!item) {
    return next(new AppError('Portfolio item not found', 404));
  }

  // Increment views
  item.views += 1;
  await item.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      item
    }
  });
});

// Create new portfolio item
exports.createPortfolioItem = catchAsync(async (req, res, next) => {
  const newItem = await PortfolioItem.create({
    ...req.body,
    freelancerId: req.user.id
  });

  // Update freelancer profile stats (optional, depending on schema)
  await FreelancerProfile.findOneAndUpdate(
    { userId: req.user.id },
    { $inc: { completedProjects: 1 } } // Or add a specific portfolio count field
  );

  res.status(201).json({
    status: 'success',
    data: {
      item: newItem
    }
  });
});

// Update portfolio item
exports.updatePortfolioItem = catchAsync(async (req, res, next) => {
  const item = await PortfolioItem.findOne({ slug: req.params.slug });

  if (!item) {
    return next(new AppError('Item not found', 404));
  }

  if (item.freelancerId.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to edit this item', 403));
  }

  const updatedItem = await PortfolioItem.findByIdAndUpdate(item._id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      item: updatedItem
    }
  });
});

// Delete portfolio item
exports.deletePortfolioItem = catchAsync(async (req, res, next) => {
  const item = await PortfolioItem.findOne({ slug: req.params.slug });

  if (!item) {
    return next(new AppError('Item not found', 404));
  }

  if (item.freelancerId.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to delete this item', 403));
  }

  await PortfolioItem.findByIdAndDelete(item._id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Like/Unlike portfolio item
exports.toggleLike = catchAsync(async (req, res, next) => {
  const item = await PortfolioItem.findOne({ slug: req.params.slug });

  if (!item) {
    return next(new AppError('Item not found', 404));
  }

  const userId = req.user.id;
  const isLiked = item.likes.includes(userId);

  if (isLiked) {
    item.likes = item.likes.filter(id => id.toString() !== userId);
  } else {
    item.likes.push(userId);
  }

  await item.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      likes: item.likes.length,
      isLiked: !isLiked
    }
  });
});
