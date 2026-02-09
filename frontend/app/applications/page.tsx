'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    ArrowRight
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
            PENDING: { label: 'قيد المراجعة', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
            REVIEWING: { label: 'تحت المراجعة', class: 'bg-blue-100 text-blue-800', icon: Eye },
            ACCEPTED: { label: 'مقبول', class: 'bg-green-100 text-green-800', icon: CheckCircle },
            REJECTED: { label: 'مرفوض', class: 'bg-red-100 text-red-800', icon: XCircle },
        };
        return statuses[status] || statuses.PENDING;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-32 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/jobs" className="text-primary-100 hover:text-white inline-flex items-center gap-1 mb-6 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                        العودة للوظائف
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">طلباتي</h1>
                            <p className="text-primary-100">{applications.length} طلب توظيف</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-12">

                {applications.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد طلبات</h3>
                        <p className="text-gray-500 mb-6">لم تقدم على أي وظيفة بعد</p>
                        <Link href="/jobs" className="btn-primary">
                            تصفح الوظائف
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => {
                            const statusBadge = getStatusBadge(app.status);
                            const StatusIcon = statusBadge.icon;

                            if (!app.jobId) {
                                return (
                                    <div key={app._id} className="card p-6 bg-gray-50 opacity-75">
                                        <div className="flex items-center gap-4 text-gray-500">
                                            <XCircle className="w-8 h-8" />
                                            <div>
                                                <p className="font-semibold">هذه الوظيفة لم تعد متاحة</p>
                                                <p className="text-sm">تم حذف الوظيفة أو انتهاء صلاحيتها</p>
                                            </div>
                                            <span className={`badge ${statusBadge.class} mr-auto`}>
                                                {statusBadge.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={app._id} className="card p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Company Logo */}
                                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            {app.jobId.companyId?.logo ? (
                                                <img
                                                    src={app.jobId.companyId.logo}
                                                    alt={app.jobId.companyId?.name || 'Company'}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                <Building2 className="w-7 h-7 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Job Info */}
                                        <div className="flex-1">
                                            <Link href={`/jobs/${app.jobId._id}`} className="text-lg font-bold text-gray-900 hover:text-primary-600">
                                                {app.jobId.title}
                                            </Link>
                                            <p className="text-gray-600">{app.jobId.companyId?.name || 'Unknown Company'}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {app.jobId.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(app.createdAt).toLocaleDateString('ar-EG')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status & Actions */}
                                        <div className="flex flex-col items-end gap-3">
                                            <span className={`badge ${statusBadge.class} flex items-center gap-1`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusBadge.label}
                                            </span>
                                            <a
                                                href={app.cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                                            >
                                                <FileText className="w-4 h-4" />
                                                عرض السيرة الذاتية
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
