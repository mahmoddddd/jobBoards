const express = require('express');
const router = express.Router();
const {
  getCompanyReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/company/:companyId', getCompanyReviews);
router.post('/', protect, authorize('USER'), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
