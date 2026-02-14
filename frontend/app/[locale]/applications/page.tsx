'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { applicationsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    Briefcase,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Loader2,
    Building2,
    MapPin,
    FileText,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';

interface Application {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        location: string;
        jobType: string;
        companyId: {
            name: string;
            logo?: string;
        };
    };
    status: string;
    cvUrl: string;
    createdAt: string;
}

export default function MyApplicationsPage() {
    const t = useTranslations('Applications');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await applicationsAPI.getMyApplications();
                setApplications(response.data.applications);
            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { label: string; class: string; icon: any }> = {
            PENDING: { label: t('pending'), class: 'bg-yellow-100 text-yellow-800', icon: Clock },
            REVIEWING: { label: t('reviewing'), class: 'bg-blue-100 text-blue-800', icon: Eye },
            ACCEPTED: { label: t('accepted'), class: 'bg-green-100 text-green-800', icon: CheckCircle },
            REJECTED: { label: t('rejected'), class: 'bg-red-100 text-red-800', icon: XCircle },
        };
        return statuses[status] || statuses.PENDING;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-32 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/jobs" className={`text-primary-100 hover:text-white inline-flex items-center gap-1 mb-6 transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}>
                        {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        {t('backToJobs')}
                    </Link>
                    <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('title')}</h1>
                            <p className="text-primary-100">{applications.length} {t('subtitle')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-12">

                {applications.length === 0 ? (
                    <div className="card p-12 text-center dark:bg-gray-800 dark:border-gray-700">
                        <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">{t('noApplications')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('noApplicationsDesc')}</p>
                        <Link href="/jobs" className="btn-primary">
                            {t('browseJobs')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => {
                            const statusBadge = getStatusBadge(app.status);
                            const StatusIcon = statusBadge.icon;

                            if (!app.jobId) {
                                return (
                                    <div key={app._id} className="card p-6 bg-gray-50 dark:bg-gray-800/50 opacity-75">
                                        <div className={`flex items-center gap-4 text-gray-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                            <XCircle className="w-8 h-8" />
                                            <div className={isRtl ? 'text-right' : 'text-left'}>
                                                <p className="font-semibold">{t('jobUnavailable')}</p>
                                                <p className="text-sm">{t('jobExpired')}</p>
                                            </div>
                                            <span className={`badge ${statusBadge.class} ${isRtl ? 'mr-auto' : 'ml-auto'}`}>
                                                {statusBadge.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={app._id} className="card p-6 dark:bg-gray-800 dark:border-gray-700">
                                    <div className={`flex flex-col md:flex-row md:items-center gap-4 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                                        {/* Company Logo */}
                                        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                            {app.jobId.companyId?.logo ? (
                                                <img
                                                    src={app.jobId.companyId.logo}
                                                    alt={app.jobId.companyId?.name || 'Company'}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                <Building2 className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>

                                        {/* Job Info */}
                                        <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                                            <Link href={`/jobs/${app.jobId._id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                                                {app.jobId.title}
                                            </Link>
                                            <p className="text-gray-600 dark:text-gray-400">{app.jobId.companyId?.name || 'Unknown Company'}</p>
                                            <div className={`flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                <span className={`flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                    <MapPin className="w-4 h-4" />
                                                    {app.jobId.location}
                                                </span>
                                                <span className={`flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(app.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status & Actions */}
                                        <div className={`flex flex-col gap-3 ${isRtl ? 'items-start' : 'items-end'}`}>
                                            <span className={`badge ${statusBadge.class} flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusBadge.label}
                                            </span>
                                            <a
                                                href={app.cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}
                                            >
                                                <FileText className="w-4 h-4" />
                                                {tc('view')} {tc('cv')}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
