const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');

// @desc    Apply to job
// @route   POST /api/applications
// @access  Private (User)
exports.applyToJob = async (req, res) => {
  try {
    const { jobId, cvUrl, cvPublicId, coverLetter } = req.body;

    // Check if job exists and is approved
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'الوظيفة غير موجودة'
      });
    }

    if (job.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'هذه الوظيفة غير متاحة للتقديم'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      userId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'لقد قدمت على هذه الوظيفة مسبقاً'
      });
    }

    const application = await Application.create({
      jobId,
      userId: req.user.id,
      cvUrl,
      cvPublicId,
      coverLetter
    });

    res.status(201).json({
      success: true,
      message: 'تم التقديم بنجاح',
      application
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'لقد قدمت على هذه الوظيفة مسبقاً'
      });
    }
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في التقديم',
      error: error.message
    });
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my-applications
// @access  Private (User)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title location jobType',
        populate: {
          path: 'companyId',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Get applications for a job (Company)
// @route   GET /api/applications/job/:jobId
// @access  Private (Company)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Verify ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'الوظيفة غير موجودة'
      });
    }

    const company = await Company.findOne({ ownerId: req.user.id });
    if (!company || job.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك'
      });
    }

    const query = { jobId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Update application status (Company)
// @route   PUT /api/applications/:id/status
// @access  Private (Company)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // Verify ownership
    const company = await Company.findOne({ ownerId: req.user.id });
    if (!company || application.jobId.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك'
      });
    }

    application.status = status;
    if (notes) application.notes = notes;
    await application.save();

    res.json({
      success: true,
      message: `تم تحديث حالة الطلب إلى ${status}`,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate({
        path: 'jobId',
        populate: {
          path: 'companyId',
          select: 'name'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // Check access
    const isOwner = application.userId._id.toString() === req.user.id;
    const company = await Company.findOne({ ownerId: req.user.id });
    const isCompanyOwner = company && application.jobId.companyId._id.toString() === company._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isCompanyOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (User - own application only)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // Only owner can delete
    if (application.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك'
      });
    }

    // Can only delete pending applications
    if (application.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف طلب تمت مراجعته'
      });
    }

    await application.deleteOne();

    res.json({
      success: true,
      message: 'تم سحب الطلب'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};
