const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const updateData = {};

    if (typeof isActive !== 'undefined') updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    res.json({
      success: true,
      message: 'تم تحديث المستخدم',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @desc    Get dashboard statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingCompanies,
      pendingJobs,
      activeJobs
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      Company.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Company.countDocuments({ status: 'PENDING' }),
      Job.countDocuments({ status: 'PENDING' }),
      Job.countDocuments({ status: 'APPROVED' })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
        pendingCompanies,
        pendingJobs,
        activeJobs
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @desc    Get chart data for admin dashboard
// @route   GET /api/admin/charts
// @access  Private/Admin
router.get('/charts', protect, authorize('ADMIN'), async (req, res) => {
  try {
    // Applications over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const applicationsOverTime = await Application.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Jobs by status
    const jobsByStatus = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top companies by jobs count
    const topCompanies = await Job.aggregate([
      { $match: { status: 'APPROVED' } },
      {
        $group: {
          _id: '$companyId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          name: '$company.name',
          count: 1
        }
      }
    ]);

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      charts: {
        applicationsOverTime: applicationsOverTime.map(item => ({
          name: new Date(item._id).toLocaleDateString('ar-EG', { weekday: 'short' }),
          value: item.count
        })),
        jobsByStatus: jobsByStatus.map(item => ({
          name: item._id === 'APPROVED' ? 'معتمدة' :
                item._id === 'PENDING' ? 'معلقة' :
                item._id === 'REJECTED' ? 'مرفوضة' : item._id,
          value: item.count
        })),
        topCompanies: topCompanies.map(item => ({
          name: item.name,
          value: item.count
        })),
        applicationsByStatus: applicationsByStatus.map(item => ({
          name: item._id === 'PENDING' ? 'معلقة' :
                item._id === 'REVIEWED' ? 'تمت المراجعة' :
                item._id === 'SHORTLISTED' ? 'مختارة' :
                item._id === 'ACCEPTED' ? 'مقبولة' :
                item._id === 'REJECTED' ? 'مرفوضة' : item._id,
          value: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
