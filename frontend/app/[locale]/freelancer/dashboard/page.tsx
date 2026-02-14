'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api, { proposalsAPI, contractsAPI, freelancersAPI } from '@/lib/api';
import {
    DollarSign,
    Briefcase,
    CheckCircle,
    Star,
    Clock,
    FileText,
    TrendingUp,
    ArrowLeft,
    Loader2,
    FolderOpen,
    AlertCircle,
    Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
    totalEarnings: number;
    activeContracts: number;
    completedProjects: number;
    avgRating: number;
    pendingProposals: number;
    acceptedProposals: number;
    rejectedProposals: number;
    totalProposals: number;
}

interface RecentProposal {
    _id: string;
    projectId: {
        _id: string;
        title: string;
        budgetMin: number;
        budgetMax: number;
    };
    bidAmount: number;
    status: string;
    createdAt: string;
}

interface ActiveContract {
    _id: string;
    title: string;
    totalAmount: number;
    status: string;
    startDate: string;
    endDate: string;
    clientId: {
        name: string;
    };
}

interface ActiveMilestone {
    _id: string;
    title: string;
    amount: number;
    dueDate: string;
    status: string;
    contractId: {
        _id: string;
        title: string;
    };
}

import { useTranslations, useLocale } from 'next-intl';

export default function FreelancerDashboard() {
    const t = useTranslations('FreelancerDashboard');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalEarnings: 0,
        activeContracts: 0,
        completedProjects: 0,
        avgRating: 0,
        pendingProposals: 0,
        acceptedProposals: 0,
        rejectedProposals: 0,
        totalProposals: 0,
    });
    const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([]);
    const [activeContracts, setActiveContracts] = useState<ActiveContract[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchDashboardData();
        }
    }, [user, authLoading]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch proposals
            const proposalsRes = await proposalsAPI.getMyProposals();
            const proposals = proposalsRes.data.proposals || [];

            // Fetch contracts
            const contractsRes = await contractsAPI.getMyContracts();
            const contracts = contractsRes.data.contracts || [];

            // Fetch freelancer profile
            let profile = null;
            try {
                const profileRes = await freelancersAPI.getMyProfile();
                profile = profileRes.data.profile;
            } catch (e) {
                // Profile might not exist yet
            }

            // Calculate stats
            const pendingProposals = proposals.filter((p: any) => p.status === 'PENDING').length;
            const acceptedProposals = proposals.filter((p: any) => p.status === 'ACCEPTED').length;
            const rejectedProposals = proposals.filter((p: any) => p.status === 'REJECTED').length;
            const activeContractsList = contracts.filter((c: any) => c.status === 'ACTIVE');
            const completedContracts = contracts.filter((c: any) => c.status === 'COMPLETED');
            const totalEarnings = completedContracts.reduce((sum: number, c: any) => sum + (c.totalAmount || 0), 0);

            setStats({
                totalEarnings,
                activeContracts: activeContractsList.length,
                completedProjects: completedContracts.length,
                avgRating: profile?.rating || 0,
                pendingProposals,
                acceptedProposals,
                rejectedProposals,
                totalProposals: proposals.length,
            });

            setRecentProposals(proposals.slice(0, 5));
            setActiveContracts(activeContractsList.slice(0, 5));
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            toast.error(t('loadingError'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const classNameMap: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            ACCEPTED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            WITHDRAWN: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
            ACTIVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };
        const className = classNameMap[status] || 'bg-gray-100 text-gray-700';
        return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>{t(`status.${status}`) || status}</span>;
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className={`flex items-center justify-between flex-wrap gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                {t('title', { name: user.name })}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {t('subtitle')}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Link
                                href="/freelancer/profile"
                                className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm text-center"
                            >
                                {t('profile')}
                            </Link>
                            <Link
                                href="/projects"
                                className="px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-all font-medium text-sm text-center shadow-lg shadow-primary-600/20"
                            >
                                {t('browseProjects')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className={`card p-5 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800/30 font-medium ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-3 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-800/50 flex items-center justify-center flex-shrink-0">
                                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{t('stats.totalEarnings')}</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-400">
                            ${stats.totalEarnings.toLocaleString()}
                        </div>
                    </div>

                    <div className={`card p-5 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800/30 font-medium ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-3 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{t('stats.activeContracts')}</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400">
                            {stats.activeContracts}
                        </div>
                    </div>

                    <div className={`card p-5 md:p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-100 dark:border-purple-800/30 font-medium ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-3 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{t('stats.completedProjects')}</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-400">
                            {stats.completedProjects}
                        </div>
                    </div>

                    <div className={`card p-5 md:p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-100 dark:border-amber-800/30 font-medium ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-3 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center flex-shrink-0">
                                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{t('stats.rating')}</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-amber-700 dark:text-amber-400">
                            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : t('stats.new')}
                            {stats.avgRating > 0 && <span className="text-sm mr-1">/ 5</span>}
                        </div>
                    </div>
                </div>

                {/* Proposals Overview */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className={`card p-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">{t('proposalsOverview.pending')}</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingProposals}</div>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('proposalsOverview.pendingDesc')}</p>
                    </div>
                    <div className={`card p-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">{t('proposalsOverview.accepted')}</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{stats.acceptedProposals}</div>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('proposalsOverview.acceptedDesc')}</p>
                    </div>
                    <div className={`card p-6 xs:col-span-2 lg:col-span-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <FileText className="w-5 h-5 text-primary-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">{t('proposalsOverview.total')}</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.totalProposals}</div>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('proposalsOverview.totalDesc')}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Proposals */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-500" />
                                {t('recentProposals.title')}
                            </h2>
                            <Link href="/freelancer/proposals" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
                                {t('recentProposals.viewAll')}
                            </Link>
                        </div>

                        {recentProposals.length > 0 ? (
                            <div className="space-y-3">
                                {recentProposals.map((proposal) => (
                                    <Link
                                        key={proposal._id}
                                        href={`/projects/${proposal.projectId?._id}`}
                                        className="block p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                    {proposal.projectId?.title || t('recentProposals.project')}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {t('recentProposals.bid', { n: proposal.bidAmount })}
                                                </p>
                                            </div>
                                            {getStatusBadge(proposal.status)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>{t('recentProposals.noProposals')}</p>
                                <Link href="/projects" className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-2 inline-block">
                                    {t('recentProposals.browseLink')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Active Contracts */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-green-500" />
                                {t('activeContractsSection.title')}
                            </h2>
                            <Link href="/contracts" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
                                {t('activeContractsSection.viewAll')}
                            </Link>
                        </div>

                        {activeContracts.length > 0 ? (
                            <div className="space-y-3">
                                {activeContracts.map((contract) => (
                                    <Link
                                        key={contract._id}
                                        href={`/contracts/${contract._id}`}
                                        className="block p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                    {contract.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {t('activeContractsSection.client', {
                                                        name: contract.clientId?.name || t('activeContractsSection.clientUnknown'),
                                                        amount: contract.totalAmount
                                                    })}
                                                </p>
                                            </div>
                                            {getStatusBadge(contract.status)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>{t('activeContractsSection.noContracts')}</p>
                                <Link href="/projects" className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-2 inline-block">
                                    {t('activeContractsSection.findProjects')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 card p-6">
                    <h2 className={`text-lg font-bold text-gray-900 dark:text-white mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('quickActions.title')}</h2>
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/projects"
                            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-200 dark:hover:border-primary-700 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{t('quickActions.browseProjects')}</span>
                        </Link>
                        <Link
                            href="/freelancer/proposals"
                            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-secondary-50 dark:hover:bg-secondary-900/10 hover:border-secondary-200 dark:hover:border-secondary-700 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{t('quickActions.myProposals')}</span>
                        </Link>
                        <Link
                            href="/contracts"
                            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-200 dark:hover:border-green-700 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FolderOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{t('quickActions.myContracts')}</span>
                        </Link>
                        <Link
                            href="/messages"
                            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-700 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{t('quickActions.messages')}</span>
                        </Link>
                        <Link
                            href="/freelancer/skills"
                            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 dark:hover:border-orange-700 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                {/* Use Star or Award icon */}
                                <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{t('quickActions.verifySkills')}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
