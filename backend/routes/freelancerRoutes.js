const express = require('express');
const router = express.Router();
const {
  createProfile,
  updateProfile,
  getMyProfile,
  getProfile,
  searchFreelancers,
  getSkills,
  seedSkills
} = require('../controllers/freelancerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', searchFreelancers);
router.get('/skills', getSkills);

// Protected routes (must be before /:id)
router.get('/me', protect, getMyProfile);
router.post('/profile', protect, createProfile);
router.put('/profile', protect, updateProfile);

// Admin
router.post('/skills/seed', protect, authorize('ADMIN'), seedSkills);

// Public (must be last - :id catch-all)
router.get('/:id', getProfile);

module.exports = router;
