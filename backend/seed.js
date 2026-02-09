const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobboard';

// ============================================
// 🔐 ALL PASSWORDS ARE: password123
// ============================================

const PASSWORD = 'password123'; // Plain text - will be hashed by User model

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('🗑️ Cleared existing data');


    // ============================================
    // 1. CREATE ADMIN
    // ============================================
    const admin = await User.create({
      name: 'مدير النظام',
      email: 'admin@jobboard.com',
      password: PASSWORD,
      role: 'ADMIN',
      phone: '01000000000',
      isActive: true
    });
    console.log('👑 Admin created: admin@jobboard.com');

    // ============================================
    // 2. CREATE COMPANIES & COMPANY USERS
    // ============================================
    const companies = [];
    const companyData = [
      {
        user: { name: 'أحمد محمد', email: 'tech@company.com', phone: '01111111111' },
        company: {
          name: 'شركة التقنية المتقدمة',
          description: 'شركة رائدة في مجال تطوير البرمجيات والحلول التقنية. نعمل مع أكبر الشركات في المنطقة.',
          email: 'info@techadvanced.com',
          website: 'https://techadvanced.com',
          industry: 'تقنية المعلومات',
          size: '51-200',
          status: 'APPROVED'
        }
      },
      {
        user: { name: 'سارة أحمد', email: 'hr@marketing.com', phone: '01222222222' },
        company: {
          name: 'وكالة التسويق الإبداعي',
          description: 'وكالة تسويق رقمي متخصصة في إدارة الحملات الإعلانية وتطوير العلامات التجارية.',
          email: 'info@creativemarketing.com',
          website: 'https://creativemarketing.com',
          industry: 'التسويق والإعلان',
          size: '11-50',
          status: 'APPROVED'
        }
      },
      {
        user: { name: 'محمد علي', email: 'jobs@fintech.com', phone: '01333333333' },
        company: {
          name: 'فينتك للخدمات المالية',
          description: 'شركة تقنية مالية تقدم حلولاً مبتكرة للدفع الإلكتروني والخدمات المصرفية الرقمية.',
          email: 'careers@fintech.com',
          website: 'https://fintech-eg.com',
          industry: 'الخدمات المالية',
          size: '201-500',
          status: 'APPROVED'
        }
      },
      {
        user: { name: 'نور الدين', email: 'hr@pending.com', phone: '01444444444' },
        company: {
          name: 'شركة جديدة للتجارة',
          description: 'شركة ناشئة في مجال التجارة الإلكترونية.',
          email: 'info@newcompany.com',
          industry: 'التجارة الإلكترونية',
          size: '1-10',
          status: 'PENDING' // This one is pending approval
        }
      }
    ];

    for (const data of companyData) {
      const user = await User.create({
        ...data.user,
        password: PASSWORD,
        role: 'COMPANY',
        isActive: true
      });

      const company = await Company.create({
        ...data.company,
        ownerId: user._id
      });

      user.companyId = company._id;
      await user.save();

      companies.push(company);
      console.log(`🏢 Company created: ${company.name}`);
    }

    // ============================================
    // 3. CREATE JOBS
    // ============================================
    const jobs = [];
    const jobsData = [
      // Tech Company Jobs
      {
        companyIndex: 0,
        jobs: [
          {
            title: 'مطور واجهات أمامية - React',
            description: `نبحث عن مطور واجهات أمامية متميز للانضمام لفريقنا.

المهام:
- تطوير واجهات مستخدم تفاعلية باستخدام React
- التعاون مع فريق التصميم لتنفيذ الواجهات
- تحسين أداء التطبيقات
- كتابة كود نظيف وقابل للصيانة`,
            requirements: `المتطلبات:
- خبرة 2+ سنوات في React.js
- إتقان HTML, CSS, JavaScript
- معرفة بـ TypeScript
- خبرة في Git`,
            location: 'القاهرة، مصر',
            jobType: 'FULL_TIME',
            experienceLevel: 'MID',
            salaryMin: 15000,
            salaryMax: 25000,
            skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Git'],
            status: 'APPROVED'
          },
          {
            title: 'مطور Backend - Node.js',
            description: `فرصة للانضمام لفريق الخوادم لدينا.

المهام:
- تطوير APIs باستخدام Node.js و Express
- تصميم قواعد البيانات
- كتابة اختبارات الوحدات
- تحسين أداء الخوادم`,
            requirements: `المتطلبات:
- خبرة 3+ سنوات في Node.js
- معرفة جيدة بـ MongoDB أو PostgreSQL
- خبرة في Docker
- فهم جيد لمبادئ REST APIs`,
            location: 'القاهرة، مصر',
            jobType: 'FULL_TIME',
            experienceLevel: 'SENIOR',
            salaryMin: 20000,
            salaryMax: 35000,
            skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'REST API'],
            status: 'APPROVED'
          },
          {
            title: 'مهندس DevOps',
            description: `نبحث عن مهندس DevOps لإدارة البنية التحتية.`,
            location: 'عن بعد',
            jobType: 'REMOTE',
            experienceLevel: 'SENIOR',
            salaryMin: 25000,
            salaryMax: 40000,
            skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
            status: 'PENDING' // Pending approval
          }
        ]
      },
      // Marketing Agency Jobs
      {
        companyIndex: 1,
        jobs: [
          {
            title: 'مدير حسابات التواصل الاجتماعي',
            description: `مطلوب مدير محترف لإدارة حسابات عملائنا على منصات التواصل.

المهام:
- إنشاء محتوى إبداعي
- إدارة الحملات الإعلانية
- تحليل الأداء وكتابة التقارير`,
            location: 'الإسكندرية، مصر',
            jobType: 'FULL_TIME',
            experienceLevel: 'MID',
            salaryMin: 10000,
            salaryMax: 18000,
            skills: ['Social Media', 'Content Creation', 'Analytics', 'Advertising'],
            status: 'APPROVED'
          },
          {
            title: 'مصمم جرافيك',
            description: `نبحث عن مصمم مبدع للعمل على مشاريع متنوعة.`,
            location: 'القاهرة، مصر',
            jobType: 'FULL_TIME',
            experienceLevel: 'ENTRY',
            salaryMin: 7000,
            salaryMax: 12000,
            skills: ['Photoshop', 'Illustrator', 'Figma', 'UI Design'],
            status: 'APPROVED'
          }
        ]
      },
      // Fintech Jobs
      {
        companyIndex: 2,
        jobs: [
          {
            title: 'محلل بيانات',
            description: `فرصة للعمل في فريق تحليل البيانات.

المهام:
- تحليل بيانات المعاملات المالية
- إنشاء dashboards وتقارير
- تطوير نماذج تنبؤية`,
            location: 'القاهرة، مصر',
            jobType: 'FULL_TIME',
            experienceLevel: 'MID',
            salaryMin: 18000,
            salaryMax: 28000,
            skills: ['Python', 'SQL', 'Power BI', 'Machine Learning'],
            status: 'APPROVED'
          },
          {
            title: 'مدير منتج',
            description: `نبحث عن مدير منتج لقيادة تطوير منتجاتنا المالية.`,
            location: 'القاهرة، مصر',
            jobType: 'FULL_TIME',
            experienceLevel: 'LEAD',
            salaryMin: 30000,
            salaryMax: 50000,
            skills: ['Product Management', 'Agile', 'Fintech', 'Leadership'],
            status: 'APPROVED'
          },
          {
            title: 'متدرب تطوير برمجيات',
            description: `برنامج تدريب لمدة 6 أشهر لحديثي التخرج.`,
            location: 'القاهرة، مصر',
            jobType: 'INTERNSHIP',
            experienceLevel: 'ENTRY',
            salaryMin: 3000,
            salaryMax: 5000,
            skills: ['JavaScript', 'Python', 'Git'],
            status: 'APPROVED'
          }
        ]
      }
    ];

    for (const companyJobs of jobsData) {
      for (const jobData of companyJobs.jobs) {
        const job = await Job.create({
          ...jobData,
          companyId: companies[companyJobs.companyIndex]._id
        });
        jobs.push(job);
        console.log(`💼 Job created: ${job.title}`);
      }
    }

    // ============================================
    // 4. CREATE APPLICANT USERS
    // ============================================
    const applicants = [];
    const applicantsData = [
      { name: 'عمر حسن', email: 'omar@gmail.com', phone: '01555555555' },
      { name: 'فاطمة محمود', email: 'fatma@gmail.com', phone: '01666666666' },
      { name: 'يوسف إبراهيم', email: 'youssef@gmail.com', phone: '01777777777' },
      { name: 'منى السيد', email: 'mona@gmail.com', phone: '01888888888' },
      { name: 'خالد عبدالله', email: 'khaled@gmail.com', phone: '01999999999' }
    ];

    for (const data of applicantsData) {
      const user = await User.create({
        ...data,
        password: PASSWORD,
        role: 'USER',
        isActive: true
      });
      applicants.push(user);
      console.log(`👤 Applicant created: ${user.email}`);
    }

    // ============================================
    // 5. CREATE APPLICATIONS
    // ============================================
    const applicationsData = [
      { userIndex: 0, jobIndex: 0, status: 'PENDING', cvUrl: 'https://example.com/cv1.pdf' },
      { userIndex: 1, jobIndex: 0, status: 'ACCEPTED', cvUrl: 'https://example.com/cv2.pdf' },
      { userIndex: 2, jobIndex: 1, status: 'PENDING', cvUrl: 'https://example.com/cv3.pdf' },
      { userIndex: 3, jobIndex: 3, status: 'REJECTED', cvUrl: 'https://example.com/cv4.pdf' },
      { userIndex: 4, jobIndex: 5, status: 'PENDING', cvUrl: 'https://example.com/cv5.pdf' },
      { userIndex: 0, jobIndex: 4, status: 'REVIEWING', cvUrl: 'https://example.com/cv1.pdf' },
      { userIndex: 1, jobIndex: 5, status: 'PENDING', cvUrl: 'https://example.com/cv2.pdf' },
      { userIndex: 2, jobIndex: 6, status: 'ACCEPTED', cvUrl: 'https://example.com/cv3.pdf' }
    ];

    for (const appData of applicationsData) {
      try {
        const application = await Application.create({
          userId: applicants[appData.userIndex]._id,
          jobId: jobs[appData.jobIndex]._id,
          status: appData.status,
          cvUrl: appData.cvUrl,
          coverLetter: 'أنا مهتم جداً بهذه الفرصة وأعتقد أن مهاراتي تتناسب مع المتطلبات.'
        });
        console.log(`📄 Application created: ${applicants[appData.userIndex].name} -> ${jobs[appData.jobIndex].title}`);
      } catch (err) {
        // Skip duplicate applications
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n========================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('🔐 ALL PASSWORDS: password123\n');
    console.log('📧 LOGIN ACCOUNTS:');
    console.log('----------------------------------------');
    console.log('👑 ADMIN:');
    console.log('   Email: admin@jobboard.com');
    console.log('   Password: password123\n');
    console.log('🏢 COMPANIES:');
    console.log('   Email: tech@company.com');
    console.log('   Email: hr@marketing.com');
    console.log('   Email: jobs@fintech.com');
    console.log('   Email: hr@pending.com (PENDING APPROVAL)');
    console.log('   Password: password123\n');
    console.log('👤 APPLICANTS:');
    console.log('   Email: omar@gmail.com');
    console.log('   Email: fatma@gmail.com');
    console.log('   Email: youssef@gmail.com');
    console.log('   Email: mona@gmail.com');
    console.log('   Email: khaled@gmail.com');
    console.log('   Password: password123\n');
    console.log('========================================');
    console.log(`📊 Total: ${await User.countDocuments()} users, ${await Company.countDocuments()} companies, ${await Job.countDocuments()} jobs, ${await Application.countDocuments()} applications`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
