const Job = require('../models/Job');
const Company = require('../models/Company');

// @desc    Get all approved jobs (public)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      companyId,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = { status: 'APPROVED' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (location) query.location = new RegExp(location, 'i');
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (companyId) query.companyId = companyId;

    // Only show non-expired jobs
    query.expiresAt = { $gt: new Date() };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('companyId', 'name logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب الوظائف',
      error: error.message
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'name logo description website');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'الوظيفة غير موجودة'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Company)
exports.createJob = async (req, res) => {
  try {
    // Get company for this user
    const company = await Company.findOne({ ownerId: req.user.id });

    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن تمتلك شركة لنشر وظيفة'
      });
    }

    if (company.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'شركتك لم تتم الموافقة عليها بعد'
      });
    }

    const job = await Job.create({
      ...req.body,
      companyId: company._id,
      status: 'PENDING' // Needs admin approval
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الوظيفة وبانتظار موافقة الإدارة',
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء الوظيفة',
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Company owner or Admin)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'الوظيفة غير موجودة'
      });
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'ADMIN') {
      const company = await Company.findOne({ ownerId: req.user.id });
      if (!company || job.companyId.toString() !== company._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بتعديل هذه الوظيفة'
        });
      }
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'تم تحديث الوظيفة',
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Company owner or Admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'الوظيفة غير موجودة'
      });
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'ADMIN') {
      const company = await Company.findOne({ ownerId: req.user.id });
      if (!company || job.companyId.toString() !== company._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بحذف هذه الوظيفة'
        });
      }
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'تم حذف الوظيفة'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Get company's jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Company)
exports.getMyJobs = async (req, res) => {
  try {
    const company = await Company.findOne({ ownerId: req.user.id });

    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد شركة مرتبطة بحسابك'
      });
    }

    const jobs = await Job.find({ companyId: company._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Get all jobs (Admin)
// @route   GET /api/jobs/admin/all
// @access  Private (Admin)
exports.getAllJobsAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Update job status (Admin)
// @route   PUT /api/jobs/:id/status
// @access  Private (Admin)
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'الوظيفة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: `تم تحديث حالة الوظيفة إلى ${status}`,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};
