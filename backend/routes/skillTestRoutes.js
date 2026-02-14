const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getSkillTests, getSkillTest, submitSkillTest, createSkillTest } = require('../controllers/skillTestController');

router.route('/')
  .get(protect, getSkillTests)
  .post(protect, authorize('ADMIN'), createSkillTest);

router.route('/:id')
  .get(protect, getSkillTest);

router.route('/:id/submit')
  .post(protect, submitSkillTest);

module.exports = router;
