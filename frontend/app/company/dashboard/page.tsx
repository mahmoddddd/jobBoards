'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { jobsAPI, companiesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    Briefcase,
    Users,
    Clock,
    Plus,
    Eye,
    Edit,
    Trash2,
    Loader2,
    Building2,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StatsLineChart, StatsPieChart, StatsBarChart } from '@/components/charts/StatsCharts';

interface Company {
    _id: string;
    name: string;
    description: string;
    status: string;
    logo?: string;
}

interface Job {
    _id: string;
    title: string;
    location: string;
    jobType: string;
    status: string;
    applicationCount: number;
    createdAt: string;
}

interface ChartData {
    applicationsOverTime: { name: string; value: number }[];
    jobsByStatus: { name: string; value: number }[];
    topJobs: { name: string; value: number }[];
    applicationsByStatus: { name: string; value: number }[];
}

export default function CompanyDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        pendingJobs: 0,
        totalApplications: 0,
    });
    const [chartData, setChartData] = useState<ChartData | null>(null);

    useEffect(() => {
        if (user?.role !== 'COMPANY') {
            router.push('/');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [companyRes, jobsRes, chartsRes] = await Promise.all([
                companiesAPI.getMyCompany(),
                jobsAPI.getMyJobs(),
                api.get('/company/charts').catch(() => ({ data: { charts: null } })),
            ]);

            setCompany(companyRes.data.company);
            setJobs(jobsRes.data.jobs);
            setChartData(chartsRes.data.charts);

            // Calculate stats
            const jobsList = jobsRes.data.jobs;
            setStats({
                totalJobs: jobsList.length,
                activeJobs: jobsList.filter((j: Job) => j.status === 'APPROVED').length,
                pendingJobs: jobsList.filter((j: Job) => j.status === 'PENDING').length,
                totalApplications: jobsList.reduce((acc: number, j: Job) => acc + j.applicationCount, 0),
            });
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    const deleteJob = async (jobId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return;

        try {
            await jobsAPI.delete(jobId);
            toast.success('تم حذف الوظيفة');
            fetchData();
        } catch (error) {
            toast.error('حدث خطأ في حذف الوظيفة');
        }
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { label: string; class: string; icon: any }> = {
            PENDING: { label: 'قيد المراجعة', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
            APPROVED: { label: 'مفعّلة', class: 'bg-green-100 text-green-800', icon: CheckCircle },
            REJECTED: { label: 'مرفوضة', class: 'bg-red-100 text-red-800', icon: XCircle },
            CLOSED: { label: 'مغلقة', class: 'bg-gray-100 text-gray-800', icon: XCircle },
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

    // Company not approved
    if (company?.status === 'PENDING') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="card p-8 max-w-lg text-center">
                    <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-4">حسابك قيد المراجعة</h1>
                    <p className="text-gray-600 mb-6">
                        شكراً لتسجيلك! جاري مراجعة بيانات شركتك من قبل فريق الإدارة.
                        سيتم إخطارك بمجرد الموافقة على حسابك.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                        عادة ما تستغرق عملية المراجعة من 24 إلى 48 ساعة
                    </div>
                </div>
            </div>
        );
    }

    if (company?.status === 'BLOCKED') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="card p-8 max-w-lg text-center">
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-4">تم إيقاف الحساب</h1>
                    <p className="text-gray-600">
                        تم إيقاف حساب شركتك. يرجى التواصل مع الدعم للمزيد من المعلومات.
                    </p>
                </div>
            </div>
        );
    }

    const jobStatusColors = [
        { name: 'معتمدة', value: 0, color: '#22c55e' },
        { name: 'معلقة', value: 0, color: '#eab308' },
        { name: 'مرفوضة', value: 0, color: '#ef4444' },
    ];

    if (chartData?.jobsByStatus) {
        chartData.jobsByStatus.forEach(item => {
            const found = jobStatusColors.find(c => c.name === item.name);
            if (found) found.value = item.value;
        });
    }

    const applicationStatusColors = [
        { name: 'معلقة', value: 0, color: '#eab308' },
        { name: 'تمت المراجعة', value: 0, color: '#3b82f6' },
        { name: 'مختارة', value: 0, color: '#8b5cf6' },
        { name: 'مقبولة', value: 0, color: '#22c55e' },
        { name: 'مرفوضة', value: 0, color: '#ef4444' },
    ];

    if (chartData?.applicationsByStatus) {
        chartData.applicationsByStatus.forEach(item => {
            const found = applicationStatusColors.find(c => c.name === item.name);
            if (found) found.value = item.value;
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
                        <p className="text-gray-600">مرحباً بك في {company?.name}</p>
                    </div>
                    <Link href="/company/jobs/new" className="btn-primary mt-4 md:mt-0">
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة وظيفة جديدة
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                                <div className="text-sm text-gray-500">إجمالي الوظائف</div>
                            </div>
                        </div>
                    </div>
                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                                <div className="text-sm text-gray-500">وظائف مفعّلة</div>
                            </div>
                        </div>
                    </div>
                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.pendingJobs}</div>
                                <div className="text-sm text-gray-500">قيد المراجعة</div>
                            </div>
                        </div>
                    </div>
                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-secondary-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                                <div className="text-sm text-gray-500">إجمالي الطلبات</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                {chartData && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatsLineChart
                            data={chartData.applicationsOverTime}
                            title="الطلبات خلال الأسبوع"
                            color="#6366f1"
                        />
                        <div className="lg:col-span-1">
                            <StatsPieChart
                                data={applicationStatusColors.filter(c => c.value > 0)}
                                title="حالات الطلبات"
                            />
                        </div>
                        <StatsBarChart
                            data={chartData.topJobs}
                            title="أكثر الوظائف طلباً"
                            color="#8b5cf6"
                        />
                    </div>
                )}

                {/* Jobs List */}
                <div className="card">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h2 className="text-xl font-bold">وظائفي</h2>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="p-12 text-center">
                            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد وظائف</h3>
                            <p className="text-gray-500 mb-4">ابدأ بإضافة أول وظيفة لشركتك</p>
                            <Link href="/company/jobs/new" className="btn-primary">
                                <Plus className="w-5 h-5 ml-2" />
                                إضافة وظيفة
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">الوظيفة</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">المتقدمين</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">التاريخ</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {jobs.map((job) => {
                                        const statusBadge = getStatusBadge(job.status);
                                        const StatusIcon = statusBadge.icon;
                                        return (
                                            <tr key={job._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{job.title}</div>
                                                    <div className="text-sm text-gray-500">{job.location}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${statusBadge.class} flex items-center gap-1 w-fit`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold">{job.applicationCount}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(job.createdAt).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/company/applicants/${job._id}`}
                                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                            title="المتقدمين"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/jobs/${job._id}`}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="عرض"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteJob(job._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
