const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getAllJobsAdmin,
  updateJobStatus
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Company routes
router.get('/company/my-jobs', protect, authorize('COMPANY'), getMyJobs);
router.post('/', protect, authorize('COMPANY'), createJob);
router.put('/:id', protect, authorize('COMPANY', 'ADMIN'), updateJob);
router.delete('/:id', protect, authorize('COMPANY', 'ADMIN'), deleteJob);

// Admin routes
router.get('/admin/all', protect, authorize('ADMIN'), getAllJobsAdmin);
router.put('/:id/status', protect, authorize('ADMIN'), updateJobStatus);

module.exports = router;
