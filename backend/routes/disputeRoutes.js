const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(authorize('ADMIN'), disputeController.getAllDisputes)
  .post(disputeController.createDispute);

router
  .route('/my')
  .get(disputeController.getMyDisputes);

router
  .route('/:id')
  .get(disputeController.getDispute);

router
  .route('/:id/messages')
  .post(disputeController.addMessage);

router
  .route('/:id/resolve')
  .patch(authorize('ADMIN'), disputeController.resolveDispute);

module.exports = router;
