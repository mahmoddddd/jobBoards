'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
    FileText, Loader2, DollarSign, Clock, CheckCircle, XCircle,
    AlertCircle, Trash2, ArrowRight, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';

interface Proposal {
    _id: string;
    projectId: {
        _id: string;
        title: string;
        budgetMin: number;
        budgetMax: number;
        budgetType: string;
        status: string;
        category: string;
        clientId: { name: string };
    };
    coverLetter: string;
    bidAmount: number;
    estimatedDuration: string;
    status: string;
    createdAt: string;
}

export default function MyProposalsPage() {
    const t = useTranslations('FreelancerProposals');
    const td = useTranslations('FreelancerDashboard'); // For status labels
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const statusMap: Record<string, { label: string; icon: any; class: string }> = {
        PENDING: { label: td('status.PENDING'), icon: AlertCircle, class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        ACCEPTED: { label: td('status.ACCEPTED'), icon: CheckCircle, class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
        REJECTED: { label: td('status.REJECTED'), icon: XCircle, class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        WITHDRAWN: { label: td('status.WITHDRAWN'), icon: Trash2, class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    };

    const durationMap: Record<string, string> = {
        LESS_THAN_1_WEEK: t('duration.LESS_THAN_1_WEEK'),
        LESS_THAN_1_MONTH: t('duration.LESS_THAN_1_MONTH'),
        '1_TO_3_MONTHS': t('duration.1_TO_3_MONTHS'),
        '3_TO_6_MONTHS': t('duration.3_TO_6_MONTHS'),
        MORE_THAN_6_MONTHS: t('duration.MORE_THAN_6_MONTHS'),
    };
    const { user } = useAuth();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { fetchProposals(); }, []);

    const fetchProposals = async () => {
        try {
            const res = await api.get('/proposals/my-proposals');
            setProposals(res.data.proposals);
        } catch (error) {
            console.error(error);
        } finally { setLoading(false); }
    };

    const withdrawProposal = async (id: string) => {
        if (!confirm(t('withdrawConfirm'))) return;
        try {
            await api.delete(`/proposals/${id}`);
            toast.success(t('withdrawnSuccess'));
            fetchProposals();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error');
        }
    };

    const filtered = filter === 'ALL' ? proposals : proposals.filter(p => p.status === filter);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/projects" className="inline-flex items-center gap-1 text-primary-600 hover:underline mb-6">
                    {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {t('backToProjects')}
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary-600" /> {t('title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('subtitle', { n: proposals.length })}</p>

                {/* Tabs */}
                <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    <div className="flex gap-2 min-w-max bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 w-fit">
                        {[
                            { key: 'ALL', label: t('tabs.ALL') },
                            { key: 'PENDING', label: t('tabs.PENDING') },
                            { key: 'ACCEPTED', label: t('tabs.ACCEPTED') },
                            { key: 'REJECTED', label: t('tabs.REJECTED') },
                            { key: 'WITHDRAWN', label: t('tabs.WITHDRAWN') },
                        ].map((tab) => (
                            <button key={tab.key} onClick={() => setFilter(tab.key)}
                                className={`px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filter === tab.key ? 'bg-primary-600 text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <div className="card p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t('noProposals')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((prop) => {
                            const statusInfo = statusMap[prop.status] || statusMap.PENDING;
                            const StatusIcon = statusInfo.icon;
                            return (
                                <div key={prop._id} className="card p-5 md:p-6 hover:shadow-lg transition-all duration-300">
                                    <div className={`flex flex-col sm:flex-row items-start justify-between gap-3 mb-4 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
                                        <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                                            <Link href={`/projects/${prop.projectId?._id}`}
                                                className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 transition block mb-1">
                                                {prop.projectId?.title}
                                            </Link>
                                            <div className="text-xs md:text-sm text-gray-500 flex flex-wrap gap-x-2 gap-y-1">
                                                <span>{t('client', { name: prop.projectId?.clientId?.name })}</span>
                                                <span className="hidden xs:inline text-gray-300">|</span>
                                                <span>{new Date(prop.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                                            </div>
                                        </div>
                                        <span className={`badge flex items-center gap-1 ${statusInfo.class} flex-shrink-0`}>
                                            <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                                        {prop.coverLetter}
                                    </p>

                                    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t dark:border-gray-700 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
                                        <div className={`flex items-center gap-4 text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                                            <span className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
                                                <DollarSign className="w-4 h-4" /> {prop.bidAmount} {t('currency')}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                <Clock className="w-4 h-4" /> {durationMap[prop.estimatedDuration]}
                                            </span>
                                        </div>
                                        {prop.status === 'PENDING' && (
                                            <button
                                                onClick={() => withdrawProposal(prop._id)}
                                                className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-sm flex items-center justify-center gap-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" /> {t('withdrawParams')}
                                            </button>
                                        )}
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
