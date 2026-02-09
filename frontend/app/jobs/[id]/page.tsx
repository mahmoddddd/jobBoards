'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobsAPI, applicationsAPI, uploadAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    MapPin,
    Clock,
    Building2,
    Briefcase,
    DollarSign,
    FileText,
    Loader2,
    ArrowRight,
    Upload,
    CheckCircle,
    XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Job {
    _id: string;
    title: string;
    description: string;
    requirements?: string;
    location: string;
    jobType: string;
    experienceLevel: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    skills: string[];
    companyId: {
        _id: string;
        name: string;
        logo?: string;
        description?: string;
        website?: string;
    };
    createdAt: string;
    applicationCount: number;
}

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await jobsAPI.getOne(id as string);
                setJob(response.data.job);
            } catch (error) {
                toast.error('حدث خطأ في جلب تفاصيل الوظيفة');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    // Check if already applied
    useEffect(() => {
        const checkApplication = async () => {
            if (user?.role === 'USER') {
                try {
                    const response = await applicationsAPI.getMyApplications();
                    const applied = response.data.applications.some((app: any) => app.jobId._id === id);
                    setHasApplied(applied);
                } catch (error) { }
            }
        };
        checkApplication();
    }, [user, id]);

    const handleApply = async () => {
        if (!cvFile) {
            toast.error('يرجى رفع السيرة الذاتية');
            return;
        }

        setApplying(true);
        try {
            // Upload CV
            const uploadResponse = await uploadAPI.uploadCV(cvFile);
            const { url, publicId } = uploadResponse.data;

            // Submit application
            await applicationsAPI.apply({
                jobId: id as string,
                cvUrl: url,
                cvPublicId: publicId,
                coverLetter,
            });

            toast.success('تم التقديم بنجاح!');
            setShowApplyModal(false);
            setHasApplied(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في التقديم');
        } finally {
            setApplying(false);
        }
    };

    const getJobTypeBadge = (type: string) => {
        const types: Record<string, { label: string; class: string }> = {
            FULL_TIME: { label: 'دوام كامل', class: 'bg-green-100 text-green-800' },
            PART_TIME: { label: 'دوام جزئي', class: 'bg-blue-100 text-blue-800' },
            CONTRACT: { label: 'عقد', class: 'bg-purple-100 text-purple-800' },
            REMOTE: { label: 'عن بعد', class: 'bg-orange-100 text-orange-800' },
            INTERNSHIP: { label: 'تدريب', class: 'bg-pink-100 text-pink-800' },
        };
        return types[type] || { label: type, class: 'bg-gray-100 text-gray-800' };
    };

    const getExperienceLabel = (level: string) => {
        const levels: Record<string, string> = {
            ENTRY: 'مبتدئ',
            MID: 'متوسط',
            SENIOR: 'خبير',
            LEAD: 'قائد',
        };
        return levels[level] || level;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <XCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">الوظيفة غير موجودة</h2>
                <Link href="/jobs" className="text-primary-600 hover:underline">
                    العودة للوظائف
                </Link>
            </div>
        );
    }

    const typeBadge = getJobTypeBadge(job.jobType);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
                    <span>/</span>
                    <Link href="/jobs" className="hover:text-primary-600">الوظائف</Link>
                    <span>/</span>
                    <span className="text-gray-900">{job.title}</span>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="card p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                                    {job.companyId.logo ? (
                                        <img src={job.companyId.logo} alt={job.companyId.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <Building2 className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                                    <Link href={`/companies/${job.companyId._id}`} className="text-primary-600 hover:underline font-medium">
                                        {job.companyId.name}
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" />
                                            {getExperienceLabel(job.experienceLevel)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {new Date(job.createdAt).toLocaleDateString('ar-EG')}
                                        </span>
                                        <span className={`badge ${typeBadge.class}`}>{typeBadge.label}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                                {job.salaryMin && (
                                    <div>
                                        <div className="text-sm text-gray-500">الراتب</div>
                                        <div className="font-semibold text-primary-600">
                                            {job.salaryMin.toLocaleString()} - {job.salaryMax?.toLocaleString()} {job.salaryCurrency}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm text-gray-500">نوع العمل</div>
                                    <div className="font-semibold">{typeBadge.label}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">الخبرة</div>
                                    <div className="font-semibold">{getExperienceLabel(job.experienceLevel)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">المتقدمين</div>
                                    <div className="font-semibold">{job.applicationCount} متقدم</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card p-6">
                            <h2 className="text-xl font-bold mb-4">وصف الوظيفة</h2>
                            <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                                {job.description}
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-4">المتطلبات</h2>
                                <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                                    {job.requirements}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-4">المهارات المطلوبة</h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map((skill, index) => (
                                        <span key={index} className="badge bg-primary-100 text-primary-800">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Apply Card */}
                        <div className="card p-6 sticky top-24">
                            {hasApplied ? (
                                <div className="text-center">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">تم التقديم</h3>
                                    <p className="text-gray-600 mb-4">لقد قدمت على هذه الوظيفة مسبقاً</p>
                                    <Link href="/applications" className="btn-secondary w-full">
                                        مراجعة طلباتي
                                    </Link>
                                </div>
                            ) : user?.role === 'USER' ? (
                                <>
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        className="btn-primary w-full text-lg py-4"
                                    >
                                        قدم الآن
                                    </button>
                                    <p className="text-sm text-gray-500 text-center mt-3">
                                        تقديم سريع برفع السيرة الذاتية
                                    </p>
                                </>
                            ) : !user ? (
                                <>
                                    <Link href="/login" className="btn-primary w-full text-lg py-4 block text-center">
                                        سجل دخول للتقديم
                                    </Link>
                                    <p className="text-sm text-gray-500 text-center mt-3">
                                        يجب تسجيل الدخول للتقديم على الوظائف
                                    </p>
                                </>
                            ) : (
                                <div className="text-center text-gray-500">
                                    حسابات الشركات لا يمكنها التقديم
                                </div>
                            )}
                        </div>

                        {/* Company Card */}
                        <div className="card p-6">
                            <h3 className="font-bold mb-4">عن الشركة</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                    {job.companyId.logo ? (
                                        <img src={job.companyId.logo} alt={job.companyId.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold">{job.companyId.name}</div>
                                </div>
                            </div>
                            {job.companyId.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                    {job.companyId.description}
                                </p>
                            )}
                            <Link href={`/companies/${job.companyId._id}`} className="btn-secondary w-full text-sm">
                                عرض ملف الشركة
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-slide-up">
                        <h2 className="text-xl font-bold mb-4">التقديم على {job.title}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السيرة الذاتية (PDF) *
                                </label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                    />
                                    {cvFile ? (
                                        <div className="text-center">
                                            <FileText className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                                            <span className="text-sm text-gray-600">{cvFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <span className="text-sm text-gray-600">اضغط لرفع الملف</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رسالة تغطية (اختياري)
                                </label>
                                <textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    className="input min-h-[100px]"
                                    placeholder="اكتب رسالة قصيرة للشركة..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="btn-secondary flex-1"
                                disabled={applying}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={applying || !cvFile}
                                className="btn-primary flex-1"
                            >
                                {applying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                        جاري التقديم...
                                    </>
                                ) : (
                                    'تأكيد التقديم'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
