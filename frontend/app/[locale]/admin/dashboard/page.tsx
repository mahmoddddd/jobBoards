'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { jobsAPI, companiesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import {
    Briefcase,
    Building2,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Eye,
    Check,
    X,
    FileText,
    TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StatsLineChart, StatsPieChart, StatsBarChart } from '@/components/charts/StatsCharts';

interface Stats {
    pendingJobs: number;
    pendingCompanies: number;
    totalJobs: number;
    totalCompanies: number;
}

interface Job {
    _id: string;
    title: string;
    status: string;
    companyId: { name: string };
    createdAt: string;
}

interface Company {
    _id: string;
    name: string;
    status: string;
    ownerId: { name: string; email: string };
    createdAt: string;
}

interface ChartData {
    applicationsOverTime: { name: string; value: number }[];
    jobsByStatus: { name: string; value: number }[];
    topCompanies: { name: string; value: number }[];
    applicationsByStatus: { name: string; value: number }[];
}

export default function AdminDashboard() {
    const t = useTranslations('AdminDashboard');
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({ pendingJobs: 0, pendingCompanies: 0, totalJobs: 0, totalCompanies: 0 });
    const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
    const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
    const [activeTab, setActiveTab] = useState<'jobs' | 'companies'>('jobs');
    const [chartData, setChartData] = useState<ChartData | null>(null);

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            router.push('/');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [jobsRes, companiesRes, chartsRes] = await Promise.all([
                jobsAPI.getAllAdmin({ status: 'PENDING' }),
                companiesAPI.getAllAdmin({ status: 'PENDING' }),
                api.get('/admin/charts'),
            ]);

            setPendingJobs(jobsRes.data.jobs);
            setPendingCompanies(companiesRes.data.companies);
            setChartData(chartsRes.data.charts);

            // Get total counts
            const [allJobsRes, allCompaniesRes] = await Promise.all([
                jobsAPI.getAllAdmin({}),
                companiesAPI.getAllAdmin({}),
            ]);

            setStats({
                pendingJobs: jobsRes.data.total,
                pendingCompanies: companiesRes.data.total,
                totalJobs: allJobsRes.data.total,
                totalCompanies: allCompaniesRes.data.total,
            });
        } catch (error) {
            toast.error('حدث خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    const updateJobStatus = async (jobId: string, status: string) => {
        try {
            await jobsAPI.updateStatus(jobId, status);
            toast.success(status === 'APPROVED' ? t('jobApproved') : t('jobRejected'));
            fetchData();
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const updateCompanyStatus = async (companyId: string, status: string) => {
        try {
            await companiesAPI.updateStatus(companyId, status);
            toast.success(status === 'APPROVED' ? t('companyApproved') : t('companyRejected'));
            fetchData();
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const jobStatusColors = [
        { id: 'APPROVED', name: t('jobStatus.APPROVED'), value: 0, color: '#22c55e' },
        { id: 'PENDING', name: t('jobStatus.PENDING'), value: 0, color: '#eab308' },
        { id: 'REJECTED', name: t('jobStatus.REJECTED'), value: 0, color: '#ef4444' },
    ];

    if (chartData?.jobsByStatus) {
        chartData.jobsByStatus.forEach(item => {
            // Try to match by ID (likely what backend sends) or name
            const found = jobStatusColors.find(c => c.id === item.name || c.name === item.name);
            if (found) found.value = item.value;
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <TrendingUp className="w-4 h-4" />
                        {t('lastUpdate')}: {new Date().toLocaleTimeString('ar-EG')}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.pendingJobs}</div>
                                <div className="text-sm text-gray-500">{t('stats.pendingJobs')}</div>
                            </div>
                        </div>
                    </div>
                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.pendingCompanies}</div>
                                <div className="text-sm text-gray-500">{t('stats.pendingCompanies')}</div>
                            </div>
                        </div>
                    </div>
                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                                <div className="text-sm text-gray-500">{t('stats.totalJobs')}</div>
                            </div>
                        </div>
                    </div>
                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-secondary-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                                <div className="text-sm text-gray-500">{t('stats.totalCompanies')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                {chartData && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatsLineChart
                            data={chartData.applicationsOverTime}
                            title={t('charts.applicationsWeek')}
                            color="#6366f1"
                        />
                        <StatsPieChart
                            data={jobStatusColors.filter(c => c.value > 0)}
                            title={t('charts.jobsByStatus')}
                        />
                        <StatsBarChart
                            data={chartData.topCompanies}
                            title={t('charts.topCompanies')}
                            color="#8b5cf6"
                        />
                    </div>
                )}

                {/* Tabs */}
                <div className="card">
                    <div className="border-b flex">
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`px-6 py-4 font-medium transition-colors ${activeTab === 'jobs'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('tabs.pendingJobs')} ({pendingJobs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('companies')}
                            className={`px-6 py-4 font-medium transition-colors ${activeTab === 'companies'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('tabs.pendingCompanies')} ({pendingCompanies.length})
                        </button>
                    </div>

                    {/* Jobs Tab */}
                    {activeTab === 'jobs' && (
                        <div>
                            {pendingJobs.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                                    <p>{t('empty.jobs')}</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {pendingJobs.map((job) => (
                                        <div key={job._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <div>
                                                <div className="font-semibold">{job.title}</div>
                                                <div className="text-sm text-gray-500">
                                                    {job.companyId.name} • {new Date(job.createdAt).toLocaleDateString('ar-EG')}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/jobs/${job._id}`}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => updateJobStatus(job._id, 'APPROVED')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => updateJobStatus(job._id, 'REJECTED')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Companies Tab */}
                    {activeTab === 'companies' && (
                        <div>
                            {pendingCompanies.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                                    <p>{t('empty.companies')}</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {pendingCompanies.map((company) => (
                                        <div key={company._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <div>
                                                <div className="font-semibold">{company.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {company.ownerId.name} ({company.ownerId.email}) • {new Date(company.createdAt).toLocaleDateString('ar-EG')}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateCompanyStatus(company._id, 'APPROVED')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => updateCompanyStatus(company._id, 'BLOCKED')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-3 gap-4 mt-8">
                    <Link href="/admin/jobs" className="card p-6 hover:shadow-lg transition-shadow">
                        <Briefcase className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="font-semibold">{t('quickLinks.manageJobs')}</h3>
                        <p className="text-sm text-gray-500">{t('quickLinks.manageJobsDesc')}</p>
                    </Link>
                    <Link href="/admin/companies" className="card p-6 hover:shadow-lg transition-shadow">
                        <Building2 className="w-8 h-8 text-secondary-600 mb-3" />
                        <h3 className="font-semibold">{t('quickLinks.manageCompanies')}</h3>
                        <p className="text-sm text-gray-500">{t('quickLinks.manageCompaniesDesc')}</p>
                    </Link>
                    <Link href="/admin/users" className="card p-6 hover:shadow-lg transition-shadow">
                        <Users className="w-8 h-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold">{t('quickLinks.manageUsers')}</h3>
                        <p className="text-sm text-gray-500">{t('quickLinks.manageUsersDesc')}</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
