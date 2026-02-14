'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
    FileText, Loader2, DollarSign, CheckCircle, Clock, AlertCircle,
    ArrowRight, ArrowLeft, XCircle
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface Contract {
    _id: string;
    title: string;
    totalAmount: number;
    status: string;
    progress: number;
    projectId: { _id: string; title: string; category: string };
    clientId: { _id: string; name: string };
    freelancerId: { _id: string; name: string };
    milestones: { status: string }[];
    createdAt: string;
}

const getStatusMap = (t: any) => {
    const map: Record<string, { label: string; class: string; icon: any }> = {
        ACTIVE: { label: t('status.ACTIVE'), class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
        COMPLETED: { label: t('status.COMPLETED'), class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
        DISPUTED: { label: t('status.DISPUTED'), class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertCircle },
        CANCELLED: { label: t('status.CANCELLED'), class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
    };
    return map;
};

export default function ContractsPage() {
    const t = useTranslations('Contracts');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { fetchContracts(); }, []);

    const fetchContracts = async () => {
        try {
            const res = await api.get('/contracts');
            setContracts(res.data.contracts);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const filtered = filter === 'ALL' ? contracts : contracts.filter(c => c.status === filter);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className={`text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <FileText className="w-8 h-8 text-primary-600" /> {t('title')}
                </h1>
                <p className={`text-gray-600 dark:text-gray-400 mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>{t('contractsCount', { n: contracts.length })}</p>

                {/* Tabs */}
                <div className={`flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 w-fit ${isRtl ? 'flex-row-reverse ml-auto' : 'mr-auto'}`}>
                    {[
                        { key: 'ALL', label: t('tabs.all') },
                        { key: 'ACTIVE', label: t('tabs.active') },
                        { key: 'COMPLETED', label: t('tabs.completed') },
                    ].map((tab) => (
                        <button key={tab.key} onClick={() => setFilter(tab.key)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${filter === tab.key ? 'bg-primary-600 text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="card p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t('noContracts')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((c) => {
                            const statusMap = getStatusMap(t);
                            const statusInfo = statusMap[c.status] || statusMap.ACTIVE;
                            const StatusIcon = statusInfo.icon;
                            const isClient = user && c.clientId?._id === user.id;
                            const otherParty = isClient ? c.freelancerId?.name : c.clientId?.name;

                            return (
                                <Link key={c._id} href={`/contracts/${c._id}`}>
                                    <div className={`card p-6 card-hover cursor-pointer mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                                        <div className={`flex items-start justify-between mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{c.title}</h3>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {isClient ? t('parties.freelancer') : t('parties.client')}: {otherParty} · {new Date(c.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                                                </div>
                                            </div>
                                            <div className={isRtl ? 'text-right' : 'text-left'}>
                                                <div className={`text-lg font-bold text-green-600 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                    <DollarSign className="w-5 h-5" /> {c.totalAmount.toLocaleString()}
                                                </div>
                                                <span className={`badge text-xs mt-1 flex items-center gap-1 ${statusInfo.class} ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                    <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-3">
                                            <div className={`flex justify-between text-xs text-gray-500 mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                <span>{t('progress')}</span>
                                                <span>{c.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div className={`h-2.5 rounded-full transition-all ${isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-primary-500 to-secondary-500`}
                                                    style={{ width: `${c.progress}%` }} />
                                            </div>
                                            <div className={`text-xs text-gray-500 mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                                                {t('milestonesCompleted', { completed: c.milestones?.filter(m => ['APPROVED', 'PAID'].includes(m.status)).length, total: c.milestones?.length })}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
