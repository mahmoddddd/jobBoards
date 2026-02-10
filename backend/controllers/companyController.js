const Company = require('../models/Company');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all approved companies (public)
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res) => {
  try {
    const { search, industry, page = 1, limit = 10 } = req.query;

    const query = { status: 'APPROVED' };

    if (search) {
      query.name = new RegExp(search, 'i');
    }
    if (industry) {
      query.industry = industry;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const companies = await Company.find(query)
      .select('name logo description industry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      count: companies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('jobs');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    res.json({
      success: true,
      company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Get my company
// @route   GET /api/companies/my-company
// @access  Private (Company)
exports.getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ ownerId: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'لا توجد شركة مرتبطة بحسابك'
      });
    }

    res.json({
      success: true,
      company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Update my company
// @route   PUT /api/companies/my-company
// @access  Private (Company)
exports.updateMyCompany = async (req, res) => {
  try {
    const { name, description, logo, website, email, phone, address, industry, size } = req.body;

    const company = await Company.findOneAndUpdate(
      { ownerId: req.user.id },
      { name, description, logo, website, email, phone, address, industry, size },
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'لا توجد شركة مرتبطة بحسابك'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث بيانات الشركة',
      company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Get all companies (Admin)
// @route   GET /api/companies/admin/all
// @access  Private (Admin)
exports.getAllCompaniesAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const companies = await Company.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      count: companies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Update company status (Admin)
// @route   PUT /api/companies/:id/status
// @access  Private (Admin)
exports.updateCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: `تم تحديث حالة الشركة إلى ${status}`,
      company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Delete company (Admin)
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // Remove company reference from owner
    await User.findByIdAndUpdate(company.ownerId, { companyId: null });

    await company.deleteOne();

    res.json({
      success: true,
      message: 'تم حذف الشركة'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Get dashboard charts data
// @route   GET /api/companies/charts
// @access  Private (Company)
exports.getDashboardStats = async (req, res) => {
  try {
    const company = await Company.findOne({ ownerId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'الشركة غير موجودة' });
    }

    // 1. Applications over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const companyJobs = await Job.find({ companyId: company._id }).select('_id title applicationCount status');
    const jobIds = companyJobs.map(j => j._id);

    const dailyApps = await Application.aggregate([
      { $match: { jobId: { $in: jobIds }, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const applicationsOverTime = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyApps.find(a => a._id === dateStr);
      applicationsOverTime.push({
        name: dayNames[d.getDay()],
        value: found ? found.count : 0
      });
    }

    // 2. Jobs by status
    const statusMap = { APPROVED: 'معتمدة', PENDING: 'معلقة', REJECTED: 'مرفوضة', CLOSED: 'مغلقة' };
    const jobsByStatusRaw = {};
    companyJobs.forEach(j => {
      jobsByStatusRaw[j.status] = (jobsByStatusRaw[j.status] || 0) + 1;
    });
    const jobsByStatus = Object.entries(jobsByStatusRaw).map(([key, val]) => ({
      name: statusMap[key] || key,
      value: val
    }));

    // 3. Top jobs by application count
    const topJobs = companyJobs
      .sort((a, b) => (b.applicationCount || 0) - (a.applicationCount || 0))
      .slice(0, 5)
      .map(j => ({ name: j.title.substring(0, 20), value: j.applicationCount || 0 }));

    // 4. Applications by status
    const appStatusMap = {
      PENDING: 'معلقة',
      REVIEWING: 'تمت المراجعة',
      ACCEPTED: 'مقبولة',
      REJECTED: 'مرفوضة'
    };
    const appsByStatus = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const applicationsByStatus = appsByStatus.map(a => ({
      name: appStatusMap[a._id] || a._id,
      value: a.count
    }));

    res.json({
      success: true,
      charts: {
        applicationsOverTime,
        jobsByStatus,
        topJobs,
        applicationsByStatus
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};
