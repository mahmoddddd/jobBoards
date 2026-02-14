'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import { jobsAPI, applicationsAPI, uploadAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, MapPin, Clock, Building2, Briefcase, DollarSign, FileText, Loader2, Upload } from 'lucide-react';
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
    const t = useTranslations('JobDetail');
    const tj = useTranslations('Jobs');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const isRtl = locale === 'ar';

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
                toast.error(t('fetchError'));
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, t]);

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
            toast.error(t('applyModal.resumeRequired'));
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

            toast.success(t('applyModal.success'));
            setShowApplyModal(false);
            setHasApplied(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('applyModal.error'));
        } finally {
            setApplying(false);
        }
    };

    const getJobTypeBadge = (type: string) => {
        const types: Record<string, { label: string; class: string }> = {
            FULL_TIME: { label: tj('fullTime'), class: 'bg-green-100 text-green-800' },
            PART_TIME: { label: tj('partTime'), class: 'bg-blue-100 text-blue-800' },
            CONTRACT: { label: tj('contract'), class: 'bg-purple-100 text-purple-800' },
            REMOTE: { label: tj('remote'), class: 'bg-orange-100 text-orange-800' },
            INTERNSHIP: { label: tj('internship'), class: 'bg-pink-100 text-pink-800' },
        };
        return types[type] || { label: type, class: 'bg-gray-100 text-gray-800' };
    };

    const getExperienceLabel = (level: string) => {
        const levels: Record<string, string> = {
            ENTRY: tj('experience.ENTRY'),
            MID: tj('experience.MID'),
            SENIOR: tj('experience.SENIOR'),
            LEAD: tj('experience.LEAD'),
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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('notFound')}</h2>
                <Link href="/jobs" className="text-primary-600 hover:underline">
                    {t('backToJobs')}
                </Link>
            </div>
        );
    }

    const typeBadge = getJobTypeBadge(job.jobType);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className={`flex items-center gap-2 text-[10px] md:text-sm text-gray-500 mb-4 md:mb-6 overflow-hidden ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                    <Link href="/" className="hover:text-primary-600 flex-shrink-0">{tc('home')}</Link>
                    <span className="flex-shrink-0">/</span>
                    <Link href="/jobs" className="hover:text-primary-600 flex-shrink-0">{tj('title')}</Link>
                    <span className="flex-shrink-0">/</span>
                    <span className="text-gray-900 truncate max-w-[120px] md:max-w-[300px]">{job.title}</span>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="card p-5 md:p-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    {job.companyId.logo ? (
                                        <img src={job.companyId.logo} alt={job.companyId.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <Building2 className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 w-full">
                                    <h1 className={`text-xl md:text-2xl font-bold text-gray-900 mb-1.5 ${isRtl ? 'md:text-right' : 'md:text-left'}`}>{job.title}</h1>
                                    <Link href={`/companies/${job.companyId._id}`} className={`text-primary-600 hover:underline font-medium block ${isRtl ? 'text-right' : 'text-left'}`}>
                                        {job.companyId.name}
                                    </Link>
                                    <div className={`flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-xs md:text-sm text-gray-500 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            {getExperienceLabel(job.experienceLevel)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(job.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                                        </span>
                                        <span className={`badge py-0.5 px-2 text-[10px] md:text-xs ${typeBadge.class}`}>{typeBadge.label}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6 pt-6 border-t dark:border-gray-700/50 ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
                                {job.salaryMin && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl md:bg-transparent md:p-0">
                                        <div className="text-[10px] md:text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">{t('salary')}</div>
                                        <div className="text-xs md:text-base font-bold text-primary-600 flex items-center gap-1">
                                            {job.salaryMin.toLocaleString()} - {job.salaryMax?.toLocaleString()} {job.salaryCurrency === 'EGP' ? tj('currencySymbol') : job.salaryCurrency}
                                        </div>
                                    </div>
                                )}
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl md:bg-transparent md:p-0">
                                    <div className="text-[10px] md:text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">{t('jobType')}</div>
                                    <div className="text-xs md:text-base font-bold">{typeBadge.label}</div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl md:bg-transparent md:p-0">
                                    <div className="text-[10px] md:text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">{t('experience')}</div>
                                    <div className="text-xs md:text-base font-bold">{getExperienceLabel(job.experienceLevel)}</div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl md:bg-transparent md:p-0">
                                    <div className="text-[10px] md:text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">{t('applicants')}</div>
                                    <div className="text-xs md:text-base font-bold">{t('applicantsCount', { n: job.applicationCount })}</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card p-6">
                            <h2 className={`text-xl font-bold mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('jobDescription')}</h2>
                            <div className={`prose max-w-none text-gray-600 whitespace-pre-line ${isRtl ? 'text-right' : 'text-left'}`}>
                                {job.description}
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-4">{t('requirements')}</h2>
                                <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                                    {job.requirements}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                            <div className="card p-6">
                                <h2 className={`text-xl font-bold mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('requiredSkills')}</h2>
                                <div className={`flex flex-wrap gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    {job.skills.map((skill: string, index: number) => (
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
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t('applied')}</h3>
                                    <p className="text-gray-600 mb-4">{t('alreadyApplied')}</p>
                                    <Link href="/applications" className="btn-secondary w-full">
                                        {t('reviewApplications')}
                                    </Link>
                                </div>
                            ) : user?.role === 'USER' ? (
                                <>
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        className="btn-primary w-full text-lg py-4"
                                    >
                                        {t('applyNow')}
                                    </button>
                                    <p className="text-sm text-gray-500 text-center mt-3">
                                        {t('submitResume')}
                                    </p>
                                </>
                            ) : !user ? (
                                <>
                                    <Link href="/login" className="btn-primary w-full text-lg py-4 block text-center">
                                        {t('loginToApply')}
                                    </Link>
                                    <p className="text-sm text-gray-500 text-center mt-3">
                                        {t('loginRequired')}
                                    </p>
                                </>
                            ) : (
                                <div className="text-center text-gray-500">
                                    {t('companyCannotApply')}
                                </div>
                            )}
                        </div>

                        {/* Company Card */}
                        <div className="card p-6">
                            <h3 className={`font-bold mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('aboutCompany')}</h3>
                            <div className={`flex items-center gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                    {job.companyId.logo ? (
                                        <img src={job.companyId.logo} alt={job.companyId.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="font-semibold">{job.companyId.name}</div>
                            </div>
                            {job.companyId.description && (
                                <p className={`text-sm text-gray-600 mb-4 line-clamp-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                                    {job.companyId.description}
                                </p>
                            )}
                            <Link href={`/companies/${job.companyId._id}`} className="btn-secondary w-full text-sm">
                                {t('viewCompanyProfile')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`bg-white rounded-2xl max-w-lg w-full p-6 animate-slide-up ${isRtl ? 'text-right' : 'text-left'}`}>
                        <h2 className="text-xl font-bold mb-4">{t('applyModal.title', { title: job.title })}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('applyModal.resume')}
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
                                            <span className="text-sm text-gray-600">{t('applyModal.uploadHint')}</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('applyModal.coverLetter')}
                                </label>
                                <textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    className="input min-h-[100px]"
                                    placeholder={t('applyModal.coverLetterPlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="btn-secondary flex-1"
                                disabled={applying}
                            >
                                {t('applyModal.cancel')}
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={applying || !cvFile}
                                className="btn-primary flex-1"
                            >
                                {applying ? (
                                    <>
                                        <Loader2 className={`w-5 h-5 ${isRtl ? 'mr-2' : 'ml-2'} animate-spin`} />
                                        {t('applyModal.applying')}
                                    </>
                                ) : (
                                    t('applyModal.confirm')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
