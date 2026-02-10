'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jobsAPI, companiesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import {
    Briefcase,
    Users,
    Clock,
    Plus,
    Eye,
    Trash2,
    Loader2,
    Building2,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    TrendingUp,
    Bell,
    RefreshCw
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
    const { socket } = useSocket();
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        pendingJobs: 0,
        totalApplications: 0,
    });
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [recentNotification, setRecentNotification] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role !== 'COMPANY') {
            router.push('/');
            return;
        }
        fetchData();
    }, [user]);

    // Real-time socket listener for new applications
    useEffect(() => {
        if (!socket) return;

        const handleNewApplication = (data: any) => {
            toast.success(`📩 طلب جديد: ${data.applicantName || 'متقدم جديد'}`, { duration: 5000 });
            setRecentNotification(data.applicantName || 'متقدم جديد');
            // Auto-refresh stats
            fetchData(true);
            setTimeout(() => setRecentNotification(null), 5000);
        };

        socket.on('new-application', handleNewApplication);
        return () => {
            socket.off('new-application', handleNewApplication);
        };
    }, [socket]);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const [companyRes, jobsRes, chartsRes] = await Promise.all([
                companiesAPI.getMyCompany(),
                jobsAPI.getMyJobs(),
                companiesAPI.getCharts().catch(() => ({ data: { charts: null } })),
            ]);

            setCompany(companyRes.data.company);
            setJobs(jobsRes.data.jobs);
            setChartData(chartsRes.data.charts);

            const jobsList = jobsRes.data.jobs;
            setStats({
                totalJobs: jobsList.length,
                activeJobs: jobsList.filter((j: Job) => j.status === 'APPROVED').length,
                pendingJobs: jobsList.filter((j: Job) => j.status === 'PENDING').length,
                totalApplications: jobsList.reduce((acc: number, j: Job) => acc + j.applicationCount, 0),
            });
        } catch (error) {
            console.error(error);
            if (!silent) toast.error('حدث خطأ في جلب البيانات');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const deleteJob = async (jobId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return;
        try {
            await jobsAPI.delete(jobId);
            toast.success('تم حذف الوظيفة');
            fetchData(true);
        } catch (error) {
            toast.error('حدث خطأ في حذف الوظيفة');
        }
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { label: string; class: string; icon: any }> = {
            PENDING: { label: 'قيد المراجعة', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
            APPROVED: { label: 'مفعّلة', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
            REJECTED: { label: 'مرفوضة', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
            CLOSED: { label: 'مغلقة', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: XCircle },
        };
        return statuses[status] || statuses.PENDING;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">جاري تحميل لوحة التحكم...</p>
                </div>
            </div>
        );
    }

    if (company?.status === 'PENDING') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 dark:bg-gray-900">
                <div className="card p-8 max-w-lg text-center">
                    <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-4 dark:text-white">حسابك قيد المراجعة</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        شكراً لتسجيلك! جاري مراجعة بيانات شركتك من قبل فريق الإدارة.
                        سيتم إخطارك بمجرد الموافقة على حسابك.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-300">
                        عادة ما تستغرق عملية المراجعة من 24 إلى 48 ساعة
                    </div>
                </div>
            </div>
        );
    }

    if (company?.status === 'BLOCKED') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 dark:bg-gray-900">
                <div className="card p-8 max-w-lg text-center">
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-4 dark:text-white">تم إيقاف الحساب</h1>
                    <p className="text-gray-600 dark:text-gray-400">
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
        { name: 'مقبولة', value: 0, color: '#22c55e' },
        { name: 'مرفوضة', value: 0, color: '#ef4444' },
    ];

    if (chartData?.applicationsByStatus) {
        chartData.applicationsByStatus.forEach(item => {
            const found = applicationStatusColors.find(c => c.name === item.name);
            if (found) found.value = item.value;
        });
    }

    const statCards = [
        { label: 'إجمالي الوظائف', value: stats.totalJobs, icon: Briefcase, bg: 'bg-primary-50 dark:bg-primary-900/20', iconColor: 'text-primary-600 dark:text-primary-400', trend: null },
        { label: 'وظائف مفعّلة', value: stats.activeJobs, icon: CheckCircle, bg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400', trend: null },
        { label: 'قيد المراجعة', value: stats.pendingJobs, icon: Clock, bg: 'bg-yellow-50 dark:bg-yellow-900/20', iconColor: 'text-yellow-600 dark:text-yellow-400', trend: null },
        { label: 'إجمالي الطلبات', value: stats.totalApplications, icon: Users, bg: 'bg-secondary-50 dark:bg-secondary-900/20', iconColor: 'text-secondary-600 dark:text-secondary-400', trend: null },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-primary-600" />
                            لوحة التحكم
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">مرحباً بك في {company?.name}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <button
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            تحديث
                        </button>
                        <Link href="/company/jobs/new" className="btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            إضافة وظيفة جديدة
                        </Link>
                    </div>
                </div>

                {/* Real-time notification banner */}
                {recentNotification && (
                    <div className="mb-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                        <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-bounce" />
                        <p className="text-primary-800 dark:text-primary-300 font-medium">
                            طلب جديد من: <span className="font-bold">{recentNotification}</span>
                        </p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="card p-6 hover:shadow-lg transition-shadow group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
                <div className="card overflow-hidden">
                    <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary-600" />
                            وظائفي
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{jobs.length} وظيفة</span>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="p-12 text-center">
                            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">لا توجد وظائف</h3>
                            <p className="text-gray-500 dark:text-gray-500 mb-4">ابدأ بإضافة أول وظيفة لشركتك</p>
                            <Link href="/company/jobs/new" className="btn-primary">
                                <Plus className="w-5 h-5 ml-2" />
                                إضافة وظيفة
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">الوظيفة</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">الحالة</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">المتقدمين</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">التاريخ</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {jobs.map((job) => {
                                        const statusBadge = getStatusBadge(job.status);
                                        const StatusIcon = statusBadge.icon;
                                        return (
                                            <tr key={job._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{job.title}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{job.location}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${statusBadge.class} flex items-center gap-1 w-fit`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900 dark:text-white">{job.applicationCount}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(job.createdAt).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/company/applicants/${job._id}`}
                                                            className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                            title="المتقدمين"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/jobs/${job._id}`}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                            title="عرض"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteJob(job._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
