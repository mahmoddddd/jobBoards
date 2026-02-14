const PortfolioItem = require('../models/PortfolioItem');

// @desc    Create a portfolio item
// @route   POST /api/portfolio
// @access  Private (Freelancer)
exports.createPortfolioItem = async (req, res) => {
  try {
    const newItem = await PortfolioItem.create({
      ...req.body,
      freelancerId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: {
        item: newItem
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all portfolio items for a freelancer
// @route   GET /api/portfolio/freelancer/:freelancerId
// @access  Public
exports.getFreelancerPortfolio = async (req, res) => {
  try {
    const items = await PortfolioItem.find({ freelancerId: req.params.freelancerId }).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: {
        items
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single portfolio item by slug
// @route   GET /api/portfolio/:slug
// @access  Public
exports.getPortfolioItem = async (req, res) => {
  try {
    const { slug } = req.params;
    const item = await PortfolioItem.findOne({ slug }).populate('freelancerId', 'name avatar');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Increment views
    item.views += 1;
    await item.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        item
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update portfolio item
// @route   PUT /api/portfolio/:slug
// @access  Private (Owner)
exports.updatePortfolioItem = async (req, res) => {
  try {
    let item = await PortfolioItem.findOne({ slug: req.params.slug });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Check ownership
    if (item.freelancerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    item = await PortfolioItem.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        item
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete portfolio item
// @route   DELETE /api/portfolio/:slug
// @access  Private (Owner)
exports.deletePortfolioItem = async (req, res) => {
  try {
    const item = await PortfolioItem.findOne({ slug: req.params.slug });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Check ownership
    if (item.freelancerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle like on portfolio item
// @route   POST /api/portfolio/:slug/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const item = await PortfolioItem.findOne({ slug: req.params.slug });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    const likeIndex = item.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      item.likes.splice(likeIndex, 1);
    } else {
      // Like
      item.likes.push(req.user.id);
    }

    await item.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        likes: item.likes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
