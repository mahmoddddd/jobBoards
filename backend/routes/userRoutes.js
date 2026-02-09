const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @desc    Get user's saved jobs
// @route   GET /api/users/saved-jobs
// @access  Private
router.get('/saved-jobs', protect, async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.user.id })
      .populate({
        path: 'jobId',
        populate: {
          path: 'companyId',
          select: 'name logo'
        }
      })
      .sort({ savedAt: -1 });

    res.json({
      success: true,
      count: savedJobs.length,
      savedJobs
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @desc    Save a job
// @route   POST /api/users/saved-jobs
// @access  Private
router.post('/saved-jobs', protect, async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'الوظيفة غير موجودة' });
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({ userId: req.user.id, jobId });
    if (existingSave) {
      return res.status(400).json({ success: false, message: 'الوظيفة محفوظة بالفعل' });
    }

    const savedJob = await SavedJob.create({
      userId: req.user.id,
      jobId,
      savedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'تم حفظ الوظيفة',
      savedJob
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @desc    Remove saved job
// @route   DELETE /api/users/saved-jobs/:id
// @access  Private
router.delete('/saved-jobs/:id', protect, async (req, res) => {
  try {
    const savedJob = await SavedJob.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!savedJob) {
      return res.status(404).json({ success: false, message: 'الوظيفة غير موجودة' });
    }

    res.json({
      success: true,
      message: 'تم إزالة الوظيفة من المحفوظات'
    });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @desc    Check if job is saved
// @route   GET /api/users/saved-jobs/check/:jobId
// @access  Private
router.get('/saved-jobs/check/:jobId', protect, async (req, res) => {
  try {
    const savedJob = await SavedJob.findOne({
      userId: req.user.id,
      jobId: req.params.jobId
    });

    res.json({
      success: true,
      isSaved: !!savedJob,
      savedJobId: savedJob?._id
    });
  } catch (error) {
    console.error('Error checking saved job:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
