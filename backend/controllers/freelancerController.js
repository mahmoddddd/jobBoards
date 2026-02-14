const FreelancerProfile = require('../models/FreelancerProfile');
const Skill = require('../models/Skill');
const User = require('../models/User');

// ==================== FREELANCER PROFILE ====================

// @desc    Create freelancer profile
// @route   POST /api/freelancers/profile
// @access  Private (User)
exports.createProfile = async (req, res) => {
  try {
    // Check if profile already exists
    const existing = await FreelancerProfile.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'لديك ملف مستقل بالفعل'
      });
    }

    const {
      title, bio, skills, category, hourlyRate,
      availability, experienceLevel, portfolio, languages, location
    } = req.body;

    const profile = await FreelancerProfile.create({
      userId: req.user.id,
      title, bio, skills, category, hourlyRate,
      availability, experienceLevel, portfolio, languages, location
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء ملف المستقل بنجاح',
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء الملف',
      error: error.message
    });
  }
};

// @desc    Update freelancer profile
// @route   PUT /api/freelancers/profile
// @access  Private (User)
exports.updateProfile = async (req, res) => {
  try {
    const {
      title, bio, skills, category, hourlyRate,
      availability, experienceLevel, portfolio, languages, location
    } = req.body;

    const profile = await FreelancerProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        title, bio, skills, category, hourlyRate,
        availability, experienceLevel, portfolio, languages, location
      },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث الملف بنجاح',
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث الملف',
      error: error.message
    });
  }
};

// @desc    Get my freelancer profile
// @route   GET /api/freelancers/me
// @access  Private (User)
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone');

    if (!profile) {
      return res.json({
        success: true,
        profile: null
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Get freelancer profile by ID
// @route   GET /api/freelancers/:id
// @access  Public
exports.getProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findById(req.params.id)
      .populate('userId', 'name email phone createdAt');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود'
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Search/Browse freelancers
// @route   GET /api/freelancers
// @access  Public
exports.searchFreelancers = async (req, res) => {
  try {
    const {
      search, category, skill, minRate, maxRate,
      availability, experienceLevel, rating,
      page = 1, limit = 12, sort = 'rating'
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filters
    if (category) query.category = category;
    if (skill) query.skills = { $in: Array.isArray(skill) ? skill : [skill] };
    if (availability) query.availability = availability;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    // Rate range
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseInt(minRate);
      if (maxRate) query.hourlyRate.$lte = parseInt(maxRate);
    }

    // Minimum rating
    if (rating) query.rating = { $gte: parseFloat(rating) };

    // Sorting
    const sortOptions = {
      rating: { rating: -1, completedProjects: -1 },
      rate_low: { hourlyRate: 1 },
      rate_high: { hourlyRate: -1 },
      newest: { createdAt: -1 },
      projects: { completedProjects: -1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [freelancers, total] = await Promise.all([
      FreelancerProfile.find(query)
        .populate('userId', 'name email')
        .sort(sortOptions[sort] || sortOptions.rating)
        .skip(skip)
        .limit(parseInt(limit)),
      FreelancerProfile.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: freelancers.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      freelancers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// ==================== SKILLS ====================

// @desc    Get all skills (optionally filtered by category)
// @route   GET /api/freelancers/skills
// @access  Public
exports.getSkills = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const skills = await Skill.find(query).sort({ name: 1 });

    // Group by category
    const grouped = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) grouped[skill.category] = [];
      grouped[skill.category].push(skill);
    });

    res.json({ success: true, skills, grouped });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};

// @desc    Seed initial skills
// @route   POST /api/freelancers/skills/seed
// @access  Private (Admin)
exports.seedSkills = async (req, res) => {
  try {
    const defaultSkills = [
      // Web Development
      { name: 'React', nameAr: 'رياكت', category: 'WEB_DEVELOPMENT' },
      { name: 'Next.js', nameAr: 'نكست جي إس', category: 'WEB_DEVELOPMENT' },
      { name: 'Node.js', nameAr: 'نود جي إس', category: 'WEB_DEVELOPMENT' },
      { name: 'TypeScript', nameAr: 'تايب سكريبت', category: 'WEB_DEVELOPMENT' },
      { name: 'Python', nameAr: 'بايثون', category: 'WEB_DEVELOPMENT' },
      { name: 'PHP', nameAr: 'بي إتش بي', category: 'WEB_DEVELOPMENT' },
      { name: 'Laravel', nameAr: 'لارافيل', category: 'WEB_DEVELOPMENT' },
      { name: 'Vue.js', nameAr: 'فيو جي إس', category: 'WEB_DEVELOPMENT' },
      { name: 'Angular', nameAr: 'أنجولار', category: 'WEB_DEVELOPMENT' },
      { name: 'MongoDB', nameAr: 'مونجو دي بي', category: 'WEB_DEVELOPMENT' },
      { name: 'PostgreSQL', nameAr: 'بوست جري إس كيو إل', category: 'WEB_DEVELOPMENT' },
      { name: 'HTML/CSS', nameAr: 'إتش تي إم إل / سي إس إس', category: 'WEB_DEVELOPMENT' },
      { name: 'WordPress', nameAr: 'ووردبريس', category: 'WEB_DEVELOPMENT' },
      // Mobile
      { name: 'React Native', nameAr: 'رياكت نيتيف', category: 'MOBILE_DEVELOPMENT' },
      { name: 'Flutter', nameAr: 'فلاتر', category: 'MOBILE_DEVELOPMENT' },
      { name: 'Swift', nameAr: 'سويفت', category: 'MOBILE_DEVELOPMENT' },
      { name: 'Kotlin', nameAr: 'كوتلن', category: 'MOBILE_DEVELOPMENT' },
      // Design
      { name: 'UI/UX Design', nameAr: 'تصميم واجهات', category: 'DESIGN' },
      { name: 'Figma', nameAr: 'فيجما', category: 'DESIGN' },
      { name: 'Adobe Photoshop', nameAr: 'فوتوشوب', category: 'DESIGN' },
      { name: 'Adobe Illustrator', nameAr: 'إلستريتور', category: 'DESIGN' },
      { name: 'Logo Design', nameAr: 'تصميم شعارات', category: 'DESIGN' },
      { name: 'Brand Identity', nameAr: 'هوية بصرية', category: 'DESIGN' },
      // Writing
      { name: 'Content Writing', nameAr: 'كتابة محتوى', category: 'WRITING' },
      { name: 'Copywriting', nameAr: 'كتابة إعلانية', category: 'WRITING' },
      { name: 'Translation', nameAr: 'ترجمة', category: 'WRITING' },
      { name: 'Technical Writing', nameAr: 'كتابة تقنية', category: 'WRITING' },
      { name: 'SEO Writing', nameAr: 'كتابة سيو', category: 'WRITING' },
      // Marketing
      { name: 'Social Media', nameAr: 'سوشيال ميديا', category: 'MARKETING' },
      { name: 'Google Ads', nameAr: 'إعلانات جوجل', category: 'MARKETING' },
      { name: 'Facebook Ads', nameAr: 'إعلانات فيسبوك', category: 'MARKETING' },
      { name: 'SEO', nameAr: 'تحسين محركات البحث', category: 'MARKETING' },
      { name: 'Email Marketing', nameAr: 'تسويق بالبريد', category: 'MARKETING' },
      // Data
      { name: 'Data Analysis', nameAr: 'تحليل بيانات', category: 'DATA_SCIENCE' },
      { name: 'Machine Learning', nameAr: 'تعلم الآلة', category: 'DATA_SCIENCE' },
      { name: 'Excel', nameAr: 'إكسل', category: 'DATA_SCIENCE' },
      { name: 'Power BI', nameAr: 'باور بي آي', category: 'DATA_SCIENCE' },
      // Video
      { name: 'Video Editing', nameAr: 'مونتاج', category: 'VIDEO_ANIMATION' },
      { name: 'Motion Graphics', nameAr: 'موشن جرافيك', category: 'VIDEO_ANIMATION' },
      { name: '3D Animation', nameAr: 'رسوم ثلاثية الأبعاد', category: 'VIDEO_ANIMATION' },
    ];

    // Use upsert to avoid duplicates
    for (const skill of defaultSkills) {
      await Skill.findOneAndUpdate(
        { name: skill.name },
        skill,
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: `تم إضافة ${defaultSkills.length} مهارة`,
      count: defaultSkills.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message
    });
  }
};
