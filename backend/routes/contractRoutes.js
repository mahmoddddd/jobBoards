const express = require('express');
const router = express.Router();
const {
  createContract,
  getMyContracts,
  getContract,
  addMilestone,
  updateMilestoneStatus
} = require('../controllers/contractController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createContract);
router.get('/', getMyContracts);
router.get('/:id', getContract);
router.post('/:id/milestones', addMilestone);
router.put('/:id/milestones/:milestoneId', updateMilestoneStatus);

module.exports = router;
