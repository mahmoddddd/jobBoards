'use client';

import { useState, useEffect } from 'react';
import {
    Building2,
    MapPin,
    Globe,
    Mail,
    Phone,
    Users,
    Briefcase,
    ArrowRight,
    ArrowLeft,
    Clock,
    Loader2,
    ExternalLink
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/navigation';
import api from '@/lib/api';
import CompanyReviews from '@/components/CompanyReviews';

interface Company {
    _id: string;
    name: string;
    description: string;
    email: string;
    phone?: string;
    website?: string;
    location?: string;
    industry?: string;
    size?: string;
    logo?: string;
}

interface Job {
    _id: string;
    title: string;
    location: string;
    jobType: string;
    experienceLevel: string;
    salaryMin?: number;
    salaryMax?: number;
    createdAt: string;
}

export default function CompanyPage() {
    const t = useTranslations('Companies');
    const tj = useTranslations('Jobs');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const params = useParams();
    const companyId = params.id as string;

    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<'about' | 'jobs' | 'reviews'>('about');

    useEffect(() => {
        fetchCompanyData();
    }, [companyId]);

    const fetchCompanyData = async () => {
        try {
            const [companyRes, jobsRes] = await Promise.all([
                api.get(`/companies/${companyId}`),
                api.get(`/jobs?companyId=${companyId}&status=APPROVED`)
            ]);
            setCompany(companyRes.data.company);
            setJobs(jobsRes.data.jobs || []);
        } catch (error) {
            console.error('Error fetching company:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const getJobTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            'FULL_TIME': tj('fullTime'),
            'PART_TIME': tj('partTime'),
            'CONTRACT': tj('contract'),
            'REMOTE': tj('remote'),
            'INTERNSHIP': tj('internship'),
        };
        return types[type] || type;
    };

    const getExperienceLabel = (level: string) => {
        const levels: { [key: string]: string } = {
            'ENTRY': tj('experience.ENTRY'),
            'MID': tj('experience.MID'),
            'SENIOR': tj('experience.SENIOR'),
            'LEAD': tj('experience.LEAD'),
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

    if (error || !company) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('companyNotFound')}</h2>
                    <Link href="/jobs" className="text-primary-600 hover:underline">
                        {t('backToJobs')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <Link href="/companies" className={`text-white/80 hover:text-white flex items-center gap-1 mb-8 w-fit transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}>
                        {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                        {t('backToCompanies')}
                    </Link>

                    <div className={`flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                        <div className={`w-24 h-24 md:w-40 md:h-40 rounded-3xl bg-white p-2 shadow-2xl transform ${isRtl ? '-rotate-3' : 'rotate-3'} hover:rotate-0 transition-transform duration-300 flex-shrink-0`}>
                            {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-full h-full object-contain rounded-2xl" />
                            ) : (
                                <div className="w-full h-full bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 text-3xl md:text-6xl font-bold">
                                    {company.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className={`text-center flex-1 w-full ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
                            <h1 className="text-2xl md:text-5xl font-bold mb-4">{company.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-white/90">
                                {company.industry && (
                                    <span className={`flex items-center gap-1.5 bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm text-xs md:text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                                        {t(`industries.${company.industry}`) || company.industry}
                                    </span>
                                )}
                                {company.location && (
                                    <span className={`flex items-center gap-1.5 bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm text-xs md:text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                                        {company.location}
                                    </span>
                                )}
                                {company.size && (
                                    <span className={`flex items-center gap-1.5 bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm text-xs md:text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <Users className="w-4 h-4 md:w-5 md:h-5" />
                                        {t('employees', { n: company.size })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Tabs */}
                        <div className={`flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto scrollbar-hide ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <button
                                onClick={() => setActiveTab('about')}
                                className={`px-4 md:px-6 py-3 font-medium transition-all relative whitespace-nowrap ${activeTab === 'about'
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                {t('tabs.about')}
                                {activeTab === 'about' && <span className="absolute bottom-0 right-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full"></span>}
                            </button>
                            <button
                                onClick={() => setActiveTab('jobs')}
                                className={`px-4 md:px-6 py-3 font-medium transition-all relative whitespace-nowrap ${activeTab === 'jobs'
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                {t('tabs.jobs')}
                                <span className="mx-2 badge-gray text-xs px-2 py-0.5 rounded-full">{jobs.length}</span>
                                {activeTab === 'jobs' && <span className="absolute bottom-0 right-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full"></span>}
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`px-4 md:px-6 py-3 font-medium transition-all relative whitespace-nowrap ${activeTab === 'reviews'
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                {t('tabs.reviews')}
                                {activeTab === 'reviews' && <span className="absolute bottom-0 right-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full"></span>}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="animate-fade-in">
                            {activeTab === 'about' && (
                                <div className="card p-8">
                                    <h2 className={`text-2xl font-bold mb-6 text-gray-900 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}>{t('aboutTitle')}</h2>
                                    <p className={`text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg ${isRtl ? 'text-right' : 'text-left'}`}>
                                        {company.description}
                                    </p>
                                </div>
                            )}

                            {activeTab === 'jobs' && (
                                <div className="space-y-4">
                                    {jobs.length === 0 ? (
                                        <div className="card p-12 text-center">
                                            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('noJobs')}</h3>
                                            <p className="text-gray-500 dark:text-gray-400">{t('followCompany')}</p>
                                        </div>
                                    ) : (
                                        jobs.map((job: Job) => (
                                            <Link
                                                key={job._id}
                                                href={`/jobs/${job._id}`}
                                                className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary-500 dark:hover:border-primary-400 transition group"
                                            >
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin className="w-4 h-4" />
                                                            {job.location}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Briefcase className="w-4 h-4" />
                                                            {getJobTypeLabel(job.jobType)}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            {getExperienceLabel(job.experienceLevel)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center md:flex-col gap-4 ${isRtl ? 'md:items-start' : 'md:items-end'}`}>
                                                    {job.salaryMin && job.salaryMax && (
                                                        <span className="badge-green font-bold text-lg">
                                                            {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {t('currency')}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-400">
                                                        {t('postedSince', { date: new Date(job.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') })}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <CompanyReviews companyId={companyId} />
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card p-6 sticky top-24">
                            <h3 className={`font-bold text-xl text-gray-900 dark:text-white mb-6 border-b dark:border-gray-700 pb-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                                {t('contactInfo')}
                            </h3>
                            <div className="space-y-6">
                                <a href={`mailto:${company.email}`} className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition group ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className={`flex-1 overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`}>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('email')}</p>
                                        <p className="font-medium text-gray-900 dark:text-white truncate" title={company.email}>{company.email}</p>
                                    </div>
                                </a>

                                {company.phone && (
                                    <a href={`tel:${company.phone}`} className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition group ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className={isRtl ? 'text-right' : 'text-left'}>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('phone')}</p>
                                            <p className="font-medium text-gray-900 dark:text-white" dir="ltr">{company.phone}</p>
                                        </div>
                                    </a>
                                )}

                                {company.website && (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition group ${isRtl ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div className={`flex-1 overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`}>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('website')}</p>
                                            <p className="font-medium text-primary-600 dark:text-primary-400 truncate flex items-center gap-1">
                                                {t('visitWebsite')} <ExternalLink className="w-3 h-3" />
                                            </p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
