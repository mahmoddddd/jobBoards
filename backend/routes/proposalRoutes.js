const express = require('express');
const router = express.Router();
const {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  updateProposalStatus,
  withdrawProposal
} = require('../controllers/proposalController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', submitProposal);
router.get('/my-proposals', getMyProposals);
router.get('/project/:projectId', getProjectProposals);
router.put('/:id/status', updateProposalStatus);
router.delete('/:id', withdrawProposal);

module.exports = router;
