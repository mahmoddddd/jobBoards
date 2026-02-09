'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Briefcase,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    Trash2,
    Eye,
    Loader2,
    ArrowRight,
    Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Job {
    _id: string;
    title: string;
    location: string;
    jobType: string;
    status: string;
    companyId: {
        _id: string;
        name: string;
    };
    applicationCount: number;
    createdAt: string;
}

export default function AdminJobsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'ADMIN') {
                router.push('/');
            } else {
                fetchJobs();
            }
        }
    }, [user, authLoading, router]);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs/admin/all');
            setJobs(res.data.jobs || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (jobId: string, newStatus: string) => {
        try {
            await api.put(`/jobs/${jobId}/status`, { status: newStatus });
            setJobs(prev => prev.map(job =>
                job._id === jobId ? { ...job, status: newStatus } : job
            ));
            toast.success('تم تحديث حالة الوظيفة');
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return;
        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs(prev => prev.filter(job => job._id !== jobId));
            toast.success('تم حذف الوظيفة');
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.companyId?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="badge badge-green">معتمدة</span>;
            case 'PENDING':
                return <span className="badge badge-yellow">معلقة</span>;
            case 'REJECTED':
                return <span className="badge badge-red">مرفوضة</span>;
            case 'CLOSED':
                return <span className="badge badge-gray">مغلقة</span>;
            default:
                return null;
        }
    };

    const getJobTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            'FULL_TIME': 'دوام كامل',
            'PART_TIME': 'دوام جزئي',
            'CONTRACT': 'عقد',
            'REMOTE': 'عن بعد',
            'INTERNSHIP': 'تدريب',
        };
        return types[type] || type;
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const pendingCount = jobs.filter(j => j.status === 'PENDING').length;
    const approvedCount = jobs.filter(j => j.status === 'APPROVED').length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin/dashboard" className="text-primary-600 hover:underline flex items-center gap-1 mb-4">
                        <ArrowRight className="w-4 h-4" />
                        العودة للوحة الإدارة
                    </Link>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">إدارة الوظائف</h1>
                            <p className="text-gray-600 mt-1">{jobs.length} وظيفة إجمالاً</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{jobs.length}</p>
                                <p className="text-gray-500 text-sm">إجمالي</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingCount}</p>
                                <p className="text-gray-500 text-sm">معلقة</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{approvedCount}</p>
                                <p className="text-gray-500 text-sm">معتمدة</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'REJECTED').length}</p>
                                <p className="text-gray-500 text-sm">مرفوضة</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="بحث بالعنوان أو اسم الشركة..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pr-12 w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input"
                            >
                                <option value="">كل الحالات</option>
                                <option value="PENDING">معلقة</option>
                                <option value="APPROVED">معتمدة</option>
                                <option value="REJECTED">مرفوضة</option>
                                <option value="CLOSED">مغلقة</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الوظيفة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الشركة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">النوع</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الحالة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الطلبات</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredJobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link href={`/jobs/${job._id}`} className="font-medium hover:text-primary-600">
                                                {job.title}
                                            </Link>
                                            <p className="text-gray-500 text-sm">{job.location}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                {job.companyId?.name || 'غير معروف'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {getJobTypeLabel(job.jobType)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(job.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {job.applicationCount || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(job.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/jobs/${job._id}`}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                                    title="عرض"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {job.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(job._id, 'APPROVED')}
                                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                                                            title="موافقة"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(job._id, 'REJECTED')}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                            title="رفض"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(job._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredJobs.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">لا توجد وظائف</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
