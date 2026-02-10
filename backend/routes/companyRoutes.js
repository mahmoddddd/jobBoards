const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompany,
  getMyCompany,
  updateMyCompany,
  getAllCompaniesAdmin,
  updateCompanyStatus,
  deleteCompany,
  getDashboardStats
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCompanies);

// Company routes (MUST be before /:id to prevent 'me' being matched as an ID)
router.get('/me', protect, authorize('COMPANY'), getMyCompany);
router.put('/me', protect, authorize('COMPANY'), updateMyCompany);
router.get('/charts', protect, authorize('COMPANY'), getDashboardStats);

// Admin routes (MUST be before /:id to prevent 'admin' being matched as an ID)
router.get('/admin/all', protect, authorize('ADMIN'), getAllCompaniesAdmin);
router.put('/:id/status', protect, authorize('ADMIN'), updateCompanyStatus);
router.delete('/:id', protect, authorize('ADMIN'), deleteCompany);

// Generic ID route (MUST be last to avoid catching specific routes)
router.get('/:id', getCompany);

module.exports = router;
