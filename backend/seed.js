const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Skill = require('./models/Skill');
const FreelancerProfile = require('./models/FreelancerProfile');
const Project = require('./models/Project');
const Proposal = require('./models/Proposal');
const Contract = require('./models/Contract');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Review = require('./models/Review');
const Notification = require('./models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobboard';
const PASSWORD = 'password123';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear ALL collections
    await Promise.all([
      User.deleteMany({}), Company.deleteMany({}), Job.deleteMany({}),
      Application.deleteMany({}), Skill.deleteMany({}), FreelancerProfile.deleteMany({}),
      Project.deleteMany({}), Proposal.deleteMany({}), Contract.deleteMany({}),
      Conversation.deleteMany({}), Message.deleteMany({}), Review.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('🗑️  Cleared all data');

    // ========== 1. ADMIN ==========
    const admin = await User.create({
      name: 'مدير النظام', email: 'admin@jobboard.com',
      password: PASSWORD, role: 'ADMIN', phone: '01000000000', isActive: true
    });
    console.log('👑 Admin created');

    // ========== 2. COMPANIES ==========
    const companyData = [
      {
        user: { name: 'أحمد محمد', email: 'tech@company.com', phone: '01111111111' },
        company: { name: 'شركة التقنية المتقدمة', description: 'شركة رائدة في تطوير البرمجيات والحلول التقنية.', email: 'info@techadvanced.com', website: 'https://techadvanced.com', industry: 'تقنية المعلومات', size: '51-200', status: 'APPROVED' }
      },
      {
        user: { name: 'سارة أحمد', email: 'hr@marketing.com', phone: '01222222222' },
        company: { name: 'وكالة التسويق الإبداعي', description: 'وكالة تسويق رقمي متخصصة في الحملات الإعلانية.', email: 'info@creativemarketing.com', website: 'https://creativemarketing.com', industry: 'التسويق والإعلان', size: '11-50', status: 'APPROVED' }
      },
      {
        user: { name: 'محمد علي', email: 'jobs@fintech.com', phone: '01333333333' },
        company: { name: 'فينتك للخدمات المالية', description: 'شركة تقنية مالية تقدم حلول الدفع الإلكتروني.', email: 'careers@fintech.com', website: 'https://fintech-eg.com', industry: 'الخدمات المالية', size: '201-500', status: 'APPROVED' }
      },
      {
        user: { name: 'نور الدين', email: 'hr@pending.com', phone: '01444444444' },
        company: { name: 'شركة جديدة للتجارة', description: 'شركة ناشئة في التجارة الإلكترونية.', email: 'info@newcompany.com', industry: 'التجارة الإلكترونية', size: '1-10', status: 'PENDING' }
      }
    ];

    const companies = [];
    const companyUsers = [];
    for (const d of companyData) {
      const u = await User.create({ ...d.user, password: PASSWORD, role: 'COMPANY', isActive: true });
      const c = await Company.create({ ...d.company, ownerId: u._id });
      u.companyId = c._id;
      await u.save();
      companies.push(c);
      companyUsers.push(u);
      console.log(`🏢 Company: ${c.name}`);
    }

    // ========== 3. JOBS ==========
    const jobsData = [
      { ci: 0, title: 'مطور واجهات أمامية - React', description: 'نبحث عن مطور واجهات أمامية متميز.\n\nالمهام:\n- تطوير واجهات تفاعلية باستخدام React\n- التعاون مع فريق التصميم\n- تحسين أداء التطبيقات', location: 'القاهرة، مصر', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryMin: 15000, salaryMax: 25000, skills: ['React', 'JavaScript', 'TypeScript', 'CSS'], status: 'APPROVED' },
      { ci: 0, title: 'مطور Backend - Node.js', description: 'فرصة للانضمام لفريق الخوادم.\n\nالمهام:\n- تطوير APIs باستخدام Node.js\n- تصميم قواعد البيانات\n- كتابة اختبارات', location: 'القاهرة، مصر', jobType: 'FULL_TIME', experienceLevel: 'SENIOR', salaryMin: 20000, salaryMax: 35000, skills: ['Node.js', 'Express', 'MongoDB', 'Docker'], status: 'APPROVED' },
      { ci: 0, title: 'مهندس DevOps', description: 'نبحث عن مهندس DevOps لإدارة البنية التحتية.', location: 'عن بعد', jobType: 'REMOTE', experienceLevel: 'SENIOR', salaryMin: 25000, salaryMax: 40000, skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], status: 'PENDING' },
      { ci: 1, title: 'مدير حسابات التواصل الاجتماعي', description: 'مطلوب مدير محترف لإدارة حسابات العملاء على منصات التواصل.', location: 'الإسكندرية، مصر', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryMin: 10000, salaryMax: 18000, skills: ['Social Media', 'Content Creation', 'Analytics'], status: 'APPROVED' },
      { ci: 1, title: 'مصمم جرافيك', description: 'نبحث عن مصمم مبدع للعمل على مشاريع متنوعة.', location: 'القاهرة، مصر', jobType: 'FULL_TIME', experienceLevel: 'ENTRY', salaryMin: 7000, salaryMax: 12000, skills: ['Photoshop', 'Illustrator', 'Figma'], status: 'APPROVED' },
      { ci: 2, title: 'محلل بيانات', description: 'فرصة للعمل في فريق تحليل البيانات المالية.', location: 'القاهرة، مصر', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryMin: 18000, salaryMax: 28000, skills: ['Python', 'SQL', 'Power BI'], status: 'APPROVED' },
      { ci: 2, title: 'مدير منتج', description: 'نبحث عن مدير منتج لقيادة تطوير منتجاتنا المالية.', location: 'القاهرة، مصر', jobType: 'FULL_TIME', experienceLevel: 'LEAD', salaryMin: 30000, salaryMax: 50000, skills: ['Product Management', 'Agile', 'Fintech'], status: 'APPROVED' },
      { ci: 2, title: 'متدرب تطوير برمجيات', description: 'برنامج تدريب لمدة 6 أشهر لحديثي التخرج.', location: 'القاهرة، مصر', jobType: 'INTERNSHIP', experienceLevel: 'ENTRY', salaryMin: 3000, salaryMax: 5000, skills: ['JavaScript', 'Python', 'Git'], status: 'APPROVED' }
    ];
    const jobs = [];
    for (const j of jobsData) {
      const { ci, ...rest } = j;
      const job = await Job.create({ ...rest, companyId: companies[ci]._id });
      jobs.push(job);
      console.log(`💼 Job: ${job.title}`);
    }

    // ========== 4. APPLICANT / FREELANCER USERS ==========
    const usersData = [
      { name: 'عمر حسن', email: 'omar@gmail.com', phone: '01555555555' },
      { name: 'فاطمة محمود', email: 'fatma@gmail.com', phone: '01666666666' },
      { name: 'يوسف إبراهيم', email: 'youssef@gmail.com', phone: '01777777777' },
      { name: 'منى السيد', email: 'mona@gmail.com', phone: '01888888888' },
      { name: 'خالد عبدالله', email: 'khaled@gmail.com', phone: '01999999999' },
      { name: 'ليلى حسين', email: 'layla@gmail.com', phone: '01012345678' },
      { name: 'حسام فوزي', email: 'hossam@gmail.com', phone: '01098765432' }
    ];
    const users = [];
    for (const d of usersData) {
      const u = await User.create({ ...d, password: PASSWORD, role: 'USER', isActive: true });
      users.push(u);
      console.log(`👤 User: ${u.name}`);
    }

    // ========== 5. APPLICATIONS ==========
    const appsData = [
      { ui: 0, ji: 0, status: 'PENDING' }, { ui: 1, ji: 0, status: 'ACCEPTED' },
      { ui: 2, ji: 1, status: 'PENDING' }, { ui: 3, ji: 3, status: 'REJECTED' },
      { ui: 4, ji: 5, status: 'PENDING' }, { ui: 0, ji: 4, status: 'REVIEWING' },
      { ui: 1, ji: 5, status: 'PENDING' }, { ui: 2, ji: 7, status: 'ACCEPTED' }
    ];
    for (const a of appsData) {
      try {
        await Application.create({ userId: users[a.ui]._id, jobId: jobs[a.ji]._id, status: a.status, cvUrl: 'https://example.com/cv.pdf', coverLetter: 'أنا مهتم جداً بهذه الفرصة وأعتقد أن مهاراتي تتناسب مع المتطلبات.' });
      } catch (e) {}
    }
    console.log('📄 Applications created');

    // ========== 6. SKILLS ==========
    const skillsData = [
      { name: 'React', nameAr: 'رياكت', category: 'WEB_DEVELOPMENT' },
      { name: 'Node.js', nameAr: 'نود', category: 'WEB_DEVELOPMENT' },
      { name: 'TypeScript', nameAr: 'تايب سكريبت', category: 'WEB_DEVELOPMENT' },
      { name: 'Python', nameAr: 'بايثون', category: 'WEB_DEVELOPMENT' },
      { name: 'Next.js', nameAr: 'نكست', category: 'WEB_DEVELOPMENT' },
      { name: 'MongoDB', nameAr: 'مونغو', category: 'WEB_DEVELOPMENT' },
      { name: 'Flutter', nameAr: 'فلاتر', category: 'MOBILE_DEVELOPMENT' },
      { name: 'React Native', nameAr: 'رياكت نيتف', category: 'MOBILE_DEVELOPMENT' },
      { name: 'Swift', nameAr: 'سويفت', category: 'MOBILE_DEVELOPMENT' },
      { name: 'Figma', nameAr: 'فيجما', category: 'DESIGN' },
      { name: 'Photoshop', nameAr: 'فوتوشوب', category: 'DESIGN' },
      { name: 'UI/UX Design', nameAr: 'تصميم واجهات', category: 'DESIGN' },
      { name: 'Content Writing', nameAr: 'كتابة المحتوى', category: 'WRITING' },
      { name: 'Copywriting', nameAr: 'كتابة إعلانية', category: 'WRITING' },
      { name: 'SEO', nameAr: 'تحسين محركات البحث', category: 'MARKETING' },
      { name: 'Google Ads', nameAr: 'إعلانات جوجل', category: 'MARKETING' },
      { name: 'Data Analysis', nameAr: 'تحليل البيانات', category: 'DATA_SCIENCE' },
      { name: 'Machine Learning', nameAr: 'تعلم الآلة', category: 'DATA_SCIENCE' },
      { name: 'Video Editing', nameAr: 'مونتاج فيديو', category: 'VIDEO_ANIMATION' },
      { name: 'Motion Graphics', nameAr: 'موشن جرافيك', category: 'VIDEO_ANIMATION' }
    ];
    await Skill.insertMany(skillsData);
    console.log('🎯 Skills seeded');

    // ========== 7. FREELANCER PROFILES ==========
    const profilesData = [
      { ui: 0, title: 'مطور Full Stack', bio: 'مطور ويب بخبرة 5 سنوات في React و Node.js. أعمل على بناء تطبيقات ويب متكاملة وعالية الأداء.', skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Next.js'], category: 'WEB_DEVELOPMENT', hourlyRate: 50, experienceLevel: 'SENIOR', availability: 'AVAILABLE', location: 'القاهرة، مصر', completedProjects: 23, rating: 4.8, totalReviews: 15, totalEarnings: 45000, successRate: 95, languages: [{ language: 'العربية', level: 'NATIVE' }, { language: 'English', level: 'FLUENT' }], portfolio: [{ title: 'متجر إلكتروني', description: 'متجر إلكتروني متكامل بنظام دفع', link: 'https://example.com' }, { title: 'لوحة تحكم', description: 'لوحة تحكم إدارية لشركة تقنية', link: 'https://example.com' }] },
      { ui: 1, title: 'مصممة UI/UX', bio: 'مصممة واجهات مستخدم بخبرة 4 سنوات. متخصصة في تصميم تجارب مستخدم سلسة وجذابة.', skills: ['Figma', 'UI/UX Design', 'Photoshop', 'Prototyping'], category: 'DESIGN', hourlyRate: 40, experienceLevel: 'MID', availability: 'AVAILABLE', location: 'الإسكندرية، مصر', completedProjects: 18, rating: 4.9, totalReviews: 12, totalEarnings: 32000, successRate: 98, languages: [{ language: 'العربية', level: 'NATIVE' }, { language: 'English', level: 'CONVERSATIONAL' }], portfolio: [{ title: 'تطبيق توصيل', description: 'تصميم واجهات تطبيق توصيل طعام', link: 'https://example.com' }] },
      { ui: 2, title: 'مطور تطبيقات موبايل', bio: 'مطور تطبيقات بخبرة 3 سنوات في Flutter و React Native.', skills: ['Flutter', 'React Native', 'Dart', 'Firebase'], category: 'MOBILE_DEVELOPMENT', hourlyRate: 45, experienceLevel: 'MID', availability: 'BUSY', location: 'المنصورة، مصر', completedProjects: 12, rating: 4.6, totalReviews: 8, totalEarnings: 28000, successRate: 90, languages: [{ language: 'العربية', level: 'NATIVE' }, { language: 'English', level: 'FLUENT' }], portfolio: [] },
      { ui: 3, title: 'كاتبة محتوى إبداعي', bio: 'كاتبة محتوى متخصصة في المقالات التقنية والتسويقية بخبرة 6 سنوات.', skills: ['Content Writing', 'Copywriting', 'SEO', 'Blogging'], category: 'WRITING', hourlyRate: 25, experienceLevel: 'SENIOR', availability: 'AVAILABLE', location: 'القاهرة، مصر', completedProjects: 45, rating: 4.7, totalReviews: 30, totalEarnings: 38000, successRate: 97, languages: [{ language: 'العربية', level: 'NATIVE' }, { language: 'English', level: 'FLUENT' }], portfolio: [] },
      { ui: 4, title: 'خبير تسويق رقمي', bio: 'متخصص في التسويق الرقمي وإعلانات Google و Facebook. خبرة 4 سنوات.', skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Analytics'], category: 'MARKETING', hourlyRate: 35, experienceLevel: 'MID', availability: 'AVAILABLE', location: 'الجيزة، مصر', completedProjects: 20, rating: 4.5, totalReviews: 14, totalEarnings: 25000, successRate: 88, languages: [{ language: 'العربية', level: 'NATIVE' }], portfolio: [] },
      { ui: 5, title: 'مصممة موشن جرافيك', bio: 'مصممة موشن جرافيك ومونتاج فيديو احترافي بخبرة 3 سنوات.', skills: ['After Effects', 'Premiere Pro', 'Motion Graphics', 'Video Editing'], category: 'VIDEO_ANIMATION', hourlyRate: 30, experienceLevel: 'MID', availability: 'AVAILABLE', location: 'القاهرة، مصر', completedProjects: 15, rating: 4.4, totalReviews: 10, totalEarnings: 20000, successRate: 92, languages: [{ language: 'العربية', level: 'NATIVE' }, { language: 'English', level: 'BASIC' }], portfolio: [] }
    ];
    const profiles = [];
    for (const p of profilesData) {
      const { ui, ...rest } = p;
      const profile = await FreelancerProfile.create({ ...rest, userId: users[ui]._id });
      profiles.push(profile);
      console.log(`🧑‍💻 Freelancer: ${rest.title}`);
    }

    // ========== 8. PROJECTS ==========
    const projectsData = [
      { ci: 0, title: 'تطوير موقع شركة متكامل', description: 'نحتاج تطوير موقع ويب متكامل للشركة يشمل صفحة رئيسية، خدمات، عملاء، ومدونة.\n\nالمتطلبات:\n- تصميم عصري ومتجاوب\n- لوحة تحكم لإدارة المحتوى\n- SEO محسن\n- سرعة تحميل عالية', category: 'WEB_DEVELOPMENT', skills: ['React', 'Next.js', 'Node.js', 'MongoDB'], budgetType: 'FIXED', budgetMin: 3000, budgetMax: 5000, duration: '1_TO_3_MONTHS', experienceLevel: 'SENIOR', status: 'OPEN' },
      { ci: 1, title: 'تصميم هوية بصرية كاملة', description: 'نبحث عن مصمم لإنشاء هوية بصرية كاملة تشمل:\n- شعار\n- ألوان وخطوط\n- بطاقات أعمال\n- قوالب سوشيال ميديا', category: 'DESIGN', skills: ['Figma', 'Photoshop', 'Illustrator', 'Brand Identity'], budgetType: 'FIXED', budgetMin: 1500, budgetMax: 3000, duration: 'LESS_THAN_1_MONTH', experienceLevel: 'MID', status: 'OPEN' },
      { ci: 2, title: 'تطوير تطبيق موبايل للخدمات المالية', description: 'نحتاج تطبيق موبايل (iOS و Android) لخدمات الدفع الإلكتروني مع واجهة مستخدم سلسة وآمنة.', category: 'MOBILE_DEVELOPMENT', skills: ['Flutter', 'Firebase', 'Payment Integration'], budgetType: 'FIXED', budgetMin: 8000, budgetMax: 15000, duration: '3_TO_6_MONTHS', experienceLevel: 'SENIOR', status: 'OPEN' },
      { ci: 0, title: 'كتابة محتوى تسويقي', description: 'نحتاج كاتب محتوى لكتابة 20 مقالة تقنية ومحتوى تسويقي للمدونة والسوشيال ميديا.', category: 'WRITING', skills: ['Content Writing', 'SEO', 'Copywriting'], budgetType: 'FIXED', budgetMin: 500, budgetMax: 1000, duration: 'LESS_THAN_1_MONTH', experienceLevel: 'MID', status: 'OPEN' },
      { ci: 1, title: 'إدارة حملة إعلانية على Google', description: 'نبحث عن خبير إعلانات لإدارة حملة Google Ads لمدة 3 أشهر.', category: 'MARKETING', skills: ['Google Ads', 'Analytics', 'SEO'], budgetType: 'HOURLY', budgetMin: 20, budgetMax: 40, duration: '1_TO_3_MONTHS', experienceLevel: 'MID', status: 'OPEN' },
      { ci: 0, title: 'تطوير API لنظام إدارة المخزون', description: 'نحتاج مطور Backend لبناء REST API متكامل لنظام إدارة المخزون.', category: 'WEB_DEVELOPMENT', skills: ['Node.js', 'Express', 'MongoDB', 'REST API'], budgetType: 'FIXED', budgetMin: 2000, budgetMax: 4000, duration: '1_TO_3_MONTHS', experienceLevel: 'SENIOR', status: 'IN_PROGRESS' },
      { ci: 2, title: 'فيديو تعريفي للشركة', description: 'نبحث عن مصمم موشن جرافيك لإنشاء فيديو تعريفي احترافي للشركة مدته دقيقتين.', category: 'VIDEO_ANIMATION', skills: ['After Effects', 'Motion Graphics', 'Video Editing'], budgetType: 'FIXED', budgetMin: 1000, budgetMax: 2000, duration: 'LESS_THAN_1_MONTH', experienceLevel: 'MID', status: 'COMPLETED' }
    ];
    const projects = [];
    for (const p of projectsData) {
      const { ci, ...rest } = p;
      const project = await Project.create({ ...rest, clientId: companyUsers[ci]._id, companyId: companies[ci]._id });
      projects.push(project);
      console.log(`📋 Project: ${project.title}`);
    }

    // ========== 9. PROPOSALS ==========
    const proposalsData = [
      { pi: 0, fi: 0, coverLetter: 'لدي خبرة كبيرة في تطوير مواقع الشركات باستخدام React و Next.js. أستطيع تسليم المشروع خلال 6 أسابيع.', bidAmount: 4000, estimatedDuration: '1_TO_3_MONTHS', status: 'PENDING' },
      { pi: 0, fi: 2, coverLetter: 'يمكنني بناء الموقع بجودة عالية مع التركيز على الأداء والسرعة.', bidAmount: 4500, estimatedDuration: '1_TO_3_MONTHS', status: 'PENDING' },
      { pi: 1, fi: 1, coverLetter: 'متخصصة في تصميم الهويات البصرية وعندي أعمال سابقة مشابهة.', bidAmount: 2000, estimatedDuration: 'LESS_THAN_1_MONTH', status: 'PENDING' },
      { pi: 2, fi: 2, coverLetter: 'لدي خبرة في تطوير تطبيقات مالية بـ Flutter مع تكامل بوابات الدفع.', bidAmount: 12000, estimatedDuration: '3_TO_6_MONTHS', status: 'PENDING' },
      { pi: 3, fi: 3, coverLetter: 'كاتبة محتوى تقني بخبرة 6 سنوات. أستطيع كتابة المقالات المطلوبة بجودة عالية.', bidAmount: 800, estimatedDuration: 'LESS_THAN_1_MONTH', status: 'ACCEPTED' },
      { pi: 4, fi: 4, coverLetter: 'خبير في إدارة حملات Google Ads مع نتائج مثبتة في تحسين ROI.', bidAmount: 30, estimatedDuration: '1_TO_3_MONTHS', status: 'PENDING' },
      { pi: 5, fi: 0, coverLetter: 'لدي خبرة في بناء APIs وأنظمة إدارة المخزون. جاهز للبدء فوراً.', bidAmount: 3000, estimatedDuration: '1_TO_3_MONTHS', status: 'ACCEPTED' },
      { pi: 6, fi: 5, coverLetter: 'متخصصة في الموشن جرافيك وعندي أعمال مشابهة لشركات كبيرة.', bidAmount: 1500, estimatedDuration: 'LESS_THAN_1_MONTH', status: 'ACCEPTED' }
    ];
    const proposals = [];
    for (const p of proposalsData) {
      const { pi, fi, ...rest } = p;
      const proposal = await Proposal.create({ ...rest, projectId: projects[pi]._id, freelancerId: users[fi]._id });
      proposals.push(proposal);
    }
    console.log(`📨 ${proposals.length} Proposals created`);

    // ========== 10. CONTRACTS ==========
    // Contract for project[3] (content writing) - active
    const contract1 = await Contract.create({
      projectId: projects[3]._id, proposalId: proposals[4]._id,
      clientId: companyUsers[0]._id, freelancerId: users[3]._id,
      title: 'عقد كتابة محتوى تسويقي', description: 'كتابة 20 مقالة تقنية ومحتوى تسويقي.',
      totalAmount: 800, status: 'ACTIVE', startDate: new Date('2026-01-15'),
      milestones: [
        { title: 'كتابة 10 مقالات أولى', description: 'تسليم أول 10 مقالات', amount: 400, dueDate: new Date('2026-02-01'), status: 'APPROVED', approvedAt: new Date('2026-01-30') },
        { title: 'كتابة 10 مقالات ثانية', description: 'تسليم باقي المقالات', amount: 400, dueDate: new Date('2026-02-15'), status: 'IN_PROGRESS' }
      ]
    });

    // Contract for project[5] (API) - active
    const contract2 = await Contract.create({
      projectId: projects[5]._id, proposalId: proposals[6]._id,
      clientId: companyUsers[0]._id, freelancerId: users[0]._id,
      title: 'عقد تطوير API لنظام إدارة المخزون', description: 'بناء REST API متكامل.',
      totalAmount: 3000, status: 'ACTIVE', startDate: new Date('2026-01-20'),
      milestones: [
        { title: 'تصميم قاعدة البيانات والـ Schema', amount: 500, dueDate: new Date('2026-02-01'), status: 'APPROVED', approvedAt: new Date('2026-01-28') },
        { title: 'تطوير CRUD APIs', amount: 1000, dueDate: new Date('2026-02-15'), status: 'SUBMITTED', submittedAt: new Date('2026-02-10') },
        { title: 'Authentication والتوثيق', amount: 750, dueDate: new Date('2026-03-01'), status: 'PENDING' },
        { title: 'الاختبارات والنشر', amount: 750, dueDate: new Date('2026-03-15'), status: 'PENDING' }
      ]
    });

    // Contract for project[6] (video) - completed
    const contract3 = await Contract.create({
      projectId: projects[6]._id, proposalId: proposals[7]._id,
      clientId: companyUsers[2]._id, freelancerId: users[5]._id,
      title: 'عقد فيديو تعريفي للشركة', description: 'إنشاء فيديو موشن جرافيك تعريفي.',
      totalAmount: 1500, status: 'COMPLETED', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-25'),
      milestones: [
        { title: 'السيناريو والقصة المصورة', amount: 300, dueDate: new Date('2026-01-07'), status: 'PAID', approvedAt: new Date('2026-01-07') },
        { title: 'التصميم والأنيميشن', amount: 800, dueDate: new Date('2026-01-18'), status: 'PAID', approvedAt: new Date('2026-01-18') },
        { title: 'المونتاج والتسليم النهائي', amount: 400, dueDate: new Date('2026-01-25'), status: 'PAID', approvedAt: new Date('2026-01-25') }
      ]
    });
    console.log('📝 3 Contracts created');

    // ========== 11. CONVERSATIONS & MESSAGES ==========
    const conv1 = await Conversation.create({
      participants: [companyUsers[0]._id, users[0]._id],
      projectId: projects[5]._id,
      lastMessage: { content: 'تم تسليم الـ APIs، يرجى المراجعة', sender: users[0]._id, createdAt: new Date('2026-02-10') }
    });
    const conv2 = await Conversation.create({
      participants: [companyUsers[0]._id, users[3]._id],
      projectId: projects[3]._id,
      lastMessage: { content: 'ممتاز، المقالات جودتها عالية جداً!', sender: companyUsers[0]._id, createdAt: new Date('2026-02-08') }
    });
    const conv3 = await Conversation.create({
      participants: [companyUsers[2]._id, users[5]._id],
      projectId: projects[6]._id,
      lastMessage: { content: 'شكراً لك، الفيديو رائع! تم التقييم ✨', sender: companyUsers[2]._id, createdAt: new Date('2026-01-26') }
    });

    const messagesData = [
      { conv: conv1._id, sender: companyUsers[0]._id, content: 'مرحباً عمر، هل يمكنك البدء هذا الأسبوع؟', createdAt: new Date('2026-01-20') },
      { conv: conv1._id, sender: users[0]._id, content: 'أهلاً! نعم جاهز للبدء فوراً.', createdAt: new Date('2026-01-20') },
      { conv: conv1._id, sender: users[0]._id, content: 'تم الانتهاء من تصميم قاعدة البيانات', createdAt: new Date('2026-01-28') },
      { conv: conv1._id, sender: companyUsers[0]._id, content: 'ممتاز، واصل على الـ APIs', createdAt: new Date('2026-01-29') },
      { conv: conv1._id, sender: users[0]._id, content: 'تم تسليم الـ APIs، يرجى المراجعة', createdAt: new Date('2026-02-10') },
      { conv: conv2._id, sender: companyUsers[0]._id, content: 'مرحباً منى، نبدأ بالمقالات التقنية أولاً', createdAt: new Date('2026-01-15') },
      { conv: conv2._id, sender: users[3]._id, content: 'حاضر، سأبدأ بالمقالات التقنية وأرسلها خلال أسبوعين', createdAt: new Date('2026-01-15') },
      { conv: conv2._id, sender: users[3]._id, content: 'تم إرسال أول 10 مقالات', createdAt: new Date('2026-01-30') },
      { conv: conv2._id, sender: companyUsers[0]._id, content: 'ممتاز، المقالات جودتها عالية جداً!', createdAt: new Date('2026-02-08') },
      { conv: conv3._id, sender: companyUsers[2]._id, content: 'مرحباً ليلى، نريد فيديو تعريفي احترافي', createdAt: new Date('2026-01-01') },
      { conv: conv3._id, sender: users[5]._id, content: 'أهلاً! سأرسل السيناريو خلال أسبوع', createdAt: new Date('2026-01-02') },
      { conv: conv3._id, sender: companyUsers[2]._id, content: 'شكراً لك، الفيديو رائع! تم التقييم ✨', createdAt: new Date('2026-01-26') }
    ];
    await Message.insertMany(messagesData.map(m => ({ conversationId: m.conv, sender: m.sender, content: m.content, createdAt: m.createdAt })));
    console.log('💬 Conversations & Messages created');

    // ========== 12. REVIEWS ==========
    // Review for completed contract (video) - client reviews freelancer
    await Review.create({
      freelancerId: users[5]._id, userId: companyUsers[2]._id, contractId: contract3._id,
      rating: 5, title: 'عمل احترافي ممتاز', comment: 'ليلى مصممة موشن جرافيك محترفة. الفيديو كان أفضل مما توقعنا. التسليم في الوقت والتواصل ممتاز.'
    });
    // Freelancer reviews client
    await Review.create({
      freelancerId: companyUsers[2]._id, userId: users[5]._id, contractId: contract3._id,
      rating: 5, title: 'عميل ممتاز', comment: 'التعامل كان رائع والمتطلبات واضحة من البداية. أنصح بالعمل معهم.'
    });
    // Company review (traditional)
    await Review.create({
      companyId: companies[0]._id, userId: users[0]._id,
      rating: 4, title: 'شركة جيدة', comment: 'بيئة عمل ممتازة وفريق محترف. الرواتب متوسطة مقارنة بالسوق.', pros: 'بيئة عمل ممتازة', cons: 'الرواتب متوسطة'
    });
    await Review.create({
      companyId: companies[0]._id, userId: users[1]._id,
      rating: 5, title: 'أفضل شركة عملت فيها', comment: 'فرص تطور مهني ممتازة ومشاريع مثيرة.', pros: 'فرص التطور', cons: 'لا يوجد'
    });
    await Review.create({
      companyId: companies[1]._id, userId: users[2]._id,
      rating: 4, title: 'تجربة جيدة', comment: 'فريق عمل متعاون ومشاريع متنوعة.', pros: 'التنوع', cons: 'ضغط العمل أحياناً'
    });
    console.log('⭐ Reviews created');

    // ========== 13. NOTIFICATIONS ==========
    const now = new Date();
    const notifsData = [
      { userId: users[0]._id, type: 'PROPOSAL_RECEIVED', title: 'عرض جديد', message: 'تم استلام عرضك على مشروع تطوير API', link: `/projects/${projects[5]._id}`, isRead: true },
      { userId: users[0]._id, type: 'CONTRACT_CREATED', title: 'عقد جديد', message: 'تم إنشاء عقد لمشروع تطوير API', link: `/contracts/${contract2._id}`, isRead: true },
      { userId: users[0]._id, type: 'MILESTONE_APPROVED', title: 'مرحلة مقبولة', message: 'تم قبول مرحلة تصميم قاعدة البيانات', link: `/contracts/${contract2._id}`, isRead: false },
      { userId: users[3]._id, type: 'CONTRACT_CREATED', title: 'عقد جديد', message: 'تم إنشاء عقد لمشروع كتابة المحتوى', link: `/contracts/${contract1._id}`, isRead: true },
      { userId: users[5]._id, type: 'CONTRACT_COMPLETED', title: 'عقد مكتمل', message: 'تم إكمال عقد الفيديو التعريفي بنجاح!', link: `/contracts/${contract3._id}`, isRead: true },
      { userId: users[5]._id, type: 'NEW_REVIEW', title: 'تقييم جديد', message: 'حصلت على تقييم 5 نجوم من فينتك للخدمات المالية', isRead: false },
      { userId: companyUsers[0]._id, type: 'PROPOSAL_RECEIVED', title: 'عرض جديد على مشروعك', message: 'تم استلام عرض جديد على مشروع تطوير موقع الشركة', link: `/projects/${projects[0]._id}`, isRead: false },
      { userId: companyUsers[0]._id, type: 'MILESTONE_SUBMITTED', title: 'مرحلة جاهزة للمراجعة', message: 'قام عمر حسن بتسليم مرحلة تطوير CRUD APIs', link: `/contracts/${contract2._id}`, isRead: false }
    ];
    await Notification.insertMany(notifsData);
    console.log('🔔 Notifications created');

    // ========== SUMMARY ==========
    console.log('\n========================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('🔐 ALL PASSWORDS: password123\n');
    console.log('📧 LOGIN ACCOUNTS:');
    console.log('----------------------------------------');
    console.log('👑 ADMIN:       admin@jobboard.com');
    console.log('🏢 COMPANIES:   tech@company.com | hr@marketing.com | jobs@fintech.com | hr@pending.com (PENDING)');
    console.log('👤 USERS:       omar@gmail.com | fatma@gmail.com | youssef@gmail.com | mona@gmail.com | khaled@gmail.com | layla@gmail.com | hossam@gmail.com');
    console.log('\n📊 DATA SUMMARY:');
    const counts = await Promise.all([
      User.countDocuments(), Company.countDocuments(), Job.countDocuments(),
      Application.countDocuments(), Skill.countDocuments(), FreelancerProfile.countDocuments(),
      Project.countDocuments(), Proposal.countDocuments(), Contract.countDocuments(),
      Conversation.countDocuments(), Message.countDocuments(), Review.countDocuments(),
      Notification.countDocuments()
    ]);
    console.log(`   👤 ${counts[0]} Users | 🏢 ${counts[1]} Companies | 💼 ${counts[2]} Jobs | 📄 ${counts[3]} Applications`);
    console.log(`   🎯 ${counts[4]} Skills | 🧑‍💻 ${counts[5]} Freelancers | 📋 ${counts[6]} Projects | 📨 ${counts[7]} Proposals`);
    console.log(`   📝 ${counts[8]} Contracts | 💬 ${counts[9]} Conversations | ✉️ ${counts[10]} Messages | ⭐ ${counts[11]} Reviews | 🔔 ${counts[12]} Notifications`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
