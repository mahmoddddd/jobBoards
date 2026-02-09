const Company = require('../models/Company');
const User = require('../models/User');

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
