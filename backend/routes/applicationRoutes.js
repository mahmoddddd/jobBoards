const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplication,
  deleteApplication
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, authorize('USER'), applyToJob);
router.get('/my-applications', protect, authorize('USER'), getMyApplications);
router.get('/:id', protect, getApplication);
router.delete('/:id', protect, authorize('USER'), deleteApplication);

// Company routes
router.get('/job/:jobId', protect, authorize('COMPANY'), getJobApplications);
router.put('/:id/status', protect, authorize('COMPANY'), updateApplicationStatus);

module.exports = router;
