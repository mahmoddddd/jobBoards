const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get company chart data
// @route   GET /api/companies/charts
// @access  Private/Company
router.get('/charts', protect, authorize('COMPANY'), async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'لا توجد شركة مرتبطة' });
    }

    // Get all company jobs
    const companyJobs = await Job.find({ companyId });
    const jobIds = companyJobs.map(job => job._id);

    // Applications over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const applicationsOverTime = await Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Applications by status for company jobs
    const applicationsByStatus = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Jobs by status
    const jobsByStatus = await Job.aggregate([
      { $match: { companyId: companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top jobs by applications
    const topJobs = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: '$jobId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          name: '$job.title',
          count: 1
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
        applicationsByStatus: applicationsByStatus.map(item => ({
          name: item._id === 'PENDING' ? 'معلقة' :
                item._id === 'REVIEWED' ? 'تمت المراجعة' :
                item._id === 'SHORTLISTED' ? 'مختارة' :
                item._id === 'ACCEPTED' ? 'مقبولة' :
                item._id === 'REJECTED' ? 'مرفوضة' : item._id,
          value: item.count
        })),
        jobsByStatus: jobsByStatus.map(item => ({
          name: item._id === 'APPROVED' ? 'معتمدة' :
                item._id === 'PENDING' ? 'معلقة' :
                item._id === 'REJECTED' ? 'مرفوضة' : item._id,
          value: item.count
        })),
        topJobs: topJobs.map(item => ({
          name: item.name.substring(0, 20) + (item.name.length > 20 ? '...' : ''),
          value: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching company chart data:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
