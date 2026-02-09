'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { applicationsAPI, jobsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    ArrowRight,
    User,
    Mail,
    Phone,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Application {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    status: string;
    cvUrl: string;
    coverLetter?: string;
    createdAt: string;
}

interface Job {
    _id: string;
    title: string;
}

export default function ApplicantsPage() {
    const { jobId } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role !== 'COMPANY') {
            router.push('/');
            return;
        }
        fetchData();
    }, [user, jobId]);

    const fetchData = async () => {
        try {
            const [applicationsRes, jobRes] = await Promise.all([
                applicationsAPI.getJobApplications(jobId as string),
                jobsAPI.getOne(jobId as string),
            ]);
            setApplications(applicationsRes.data.applications);
            setJob(jobRes.data.job);
        } catch (error) {
            toast.error('حدث خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (appId: string, status: string) => {
        setUpdating(appId);
        try {
            await applicationsAPI.updateStatus(appId, status);
            toast.success(status === 'ACCEPTED' ? 'تم قبول الطلب' : 'تم رفض الطلب');
            fetchData();
        } catch (error) {
            toast.error('حدث خطأ');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { label: string; class: string }> = {
            PENDING: { label: 'قيد المراجعة', class: 'bg-yellow-100 text-yellow-800' },
            REVIEWING: { label: 'تحت المراجعة', class: 'bg-blue-100 text-blue-800' },
            ACCEPTED: { label: 'مقبول', class: 'bg-green-100 text-green-800' },
            REJECTED: { label: 'مرفوض', class: 'bg-red-100 text-red-800' },
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/company/dashboard" className="hover:text-primary-600">لوحة التحكم</Link>
                    <span>/</span>
                    <span className="text-gray-900">المتقدمين على {job?.title}</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    المتقدمين ({applications.length})
                </h1>

                {applications.length === 0 ? (
                    <div className="card p-12 text-center">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">لا يوجد متقدمين</h3>
                        <p className="text-gray-500">لم يتقدم أحد على هذه الوظيفة بعد</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => {
                            const statusBadge = getStatusBadge(app.status);

                            return (
                                <div key={app._id} className="card p-6">
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-xl font-bold">
                                                {app.userId.name.charAt(0)}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{app.userId.name}</h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-4 h-4" />
                                                    {app.userId.email}
                                                </span>
                                                {app.userId.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-4 h-4" />
                                                        {app.userId.phone}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(app.createdAt).toLocaleDateString('ar-EG')}
                                                </span>
                                            </div>

                                            {app.coverLetter && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                                    <strong>رسالة التغطية:</strong>
                                                    <p className="mt-1">{app.coverLetter}</p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-wrap items-center gap-3 mt-4">
                                                <a
                                                    href={app.cvUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-secondary text-sm py-2"
                                                >
                                                    <FileText className="w-4 h-4 ml-1" />
                                                    عرض السيرة الذاتية
                                                </a>

                                                {app.status === 'PENDING' || app.status === 'REVIEWING' ? (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(app._id, 'ACCEPTED')}
                                                            disabled={updating === app._id}
                                                            className="btn bg-green-600 text-white hover:bg-green-700 text-sm py-2"
                                                        >
                                                            {updating === app._id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4 ml-1" />
                                                                    قبول
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(app._id, 'REJECTED')}
                                                            disabled={updating === app._id}
                                                            className="btn bg-red-600 text-white hover:bg-red-700 text-sm py-2"
                                                        >
                                                            <XCircle className="w-4 h-4 ml-1" />
                                                            رفض
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className={`badge ${statusBadge.class}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                )}
                                            </div>
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
