const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { scheduleInterview, getInterviews, updateInterview } = require('../controllers/interviewController');

router.route('/')
  .post(protect, authorize('COMPANY'), scheduleInterview)
  .get(protect, getInterviews);

router.route('/:id')
  .put(protect, authorize('COMPANY', 'USER'), updateInterview); // User can cancel/reschedule if logic permits

module.exports = router;
