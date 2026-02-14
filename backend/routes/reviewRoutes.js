const express = require('express');
const router = express.Router();
const {
  getCompanyReviews,
  getFreelancerReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/company/:companyId', getCompanyReviews);
router.get('/freelancer/:freelancerId', getFreelancerReviews);

router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
