const Project = require('../models/Project');
const Company = require('../models/Company');

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Company or User)
exports.createProject = async (req, res) => {
  try {
    const {
      title, description, category, skills, budgetType,
      budgetMin, budgetMax, duration, experienceLevel, attachments, deadline
    } = req.body;

    const projectData = {
      title, description, category, skills, budgetType,
      budgetMin, budgetMax, duration, experienceLevel, attachments, deadline,
      clientId: req.user.id
    };

    // If company user, link the company
    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ ownerId: req.user.id });
      if (company) projectData.companyId = company._id;
    }

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: 'تم نشر المشروع بنجاح',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء المشروع',
      error: error.message
    });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Owner)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    }
    if (project.clientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    const {
      title, description, category, skills, budgetType,
      budgetMin, budgetMax, duration, experienceLevel, attachments, deadline
    } = req.body;

    Object.assign(project, {
      title, description, category, skills, budgetType,
      budgetMin, budgetMax, duration, experienceLevel, attachments, deadline
    });

    await project.save();
    res.json({ success: true, message: 'تم تحديث المشروع', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'name email createdAt')
      .populate('companyId', 'name logo')
      .populate('assignedTo', 'name');

    if (!project) {
      return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Browse/search projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
  try {
    const {
      search, category, budgetType, minBudget, maxBudget,
      duration, experienceLevel, status = 'OPEN',
      page = 1, limit = 12, sort = 'newest'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (budgetType) query.budgetType = budgetType;
    if (duration) query.duration = duration;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (minBudget || maxBudget) {
      query.budgetMax = {};
      if (minBudget) query.budgetMin = { $gte: parseInt(minBudget) };
      if (maxBudget) query.budgetMax = { $lte: parseInt(maxBudget) };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      budget_high: { budgetMax: -1 },
      budget_low: { budgetMin: 1 },
      proposals: { proposalCount: -1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('clientId', 'name')
        .populate('companyId', 'name logo')
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: projects.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      projects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Get my projects (client)
// @route   GET /api/projects/my-projects
// @access  Private
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ clientId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Owner)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'المشروع غير موجود' });
    }
    if (project.clientId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    await project.deleteOne();
    res.json({ success: true, message: 'تم حذف المشروع' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ', error: error.message });
  }
};
