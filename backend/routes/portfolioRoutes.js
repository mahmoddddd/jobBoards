const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .post(protect, authorize('FREELANCER'), portfolioController.createPortfolioItem);

router
  .route('/freelancer/:freelancerId')
  .get(portfolioController.getFreelancerPortfolio);

router
  .route('/:slug')
  .get(portfolioController.getPortfolioItem)
  .put(protect, authorize('FREELANCER'), portfolioController.updatePortfolioItem)
  .delete(protect, authorize('FREELANCER'), portfolioController.deletePortfolioItem);

router
  .route('/:slug/like')
  .post(protect, portfolioController.toggleLike);

module.exports = router;
