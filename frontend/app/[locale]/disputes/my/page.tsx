'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import api from '@/lib/api';
import {
    Loader2, AlertTriangle, ShieldAlert, CheckCircle,
    XCircle, Clock, ArrowRight, ArrowLeft, MessageSquare
} from 'lucide-react';

interface Dispute {
    _id: string;
    contractId: { _id: string; title: string };
    status: string;
    createdAt: string;
}

export default function MyDisputesPage() {
    const t = useTranslations('Disputes');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const res = await api.get('/disputes/my');
            setDisputes(res.data.data.disputes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;

    const statusMap: Record<string, { label: string, class: string, icon: any }> = {
        OPEN: { label: t('status.OPEN'), class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
        UNDER_REVIEW: { label: t('status.UNDER_REVIEW'), class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: ShieldAlert },
        RESOLVED: { label: t('status.RESOLVED'), class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
        REJECTED: { label: t('status.REJECTED'), class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className={`text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <AlertTriangle className="w-8 h-8 text-red-500" /> {t('myDisputes')}
                </h1>

                {disputes.length === 0 ? (
                    <div className="card p-12 text-center">
                        <ShieldAlert className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t('noDisputes')}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {disputes.map((d) => {
                            const statusInfo = statusMap[d.status] || statusMap.OPEN;
                            const StatusIcon = statusInfo.icon;
                            return (
                                <Link key={d._id} href={`/disputes/${d._id}`}>
                                    <div className={`card p-6 card-hover flex items-center justify-between group ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                                {d.contractId.title}
                                            </h3>
                                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {new Date(d.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                            <span className={`badge flex items-center gap-1.5 py-1 px-3 text-xs ${statusInfo.class}`}>
                                                <StatusIcon className="w-3.5 h-3.5" /> {statusInfo.label}
                                            </span>
                                            {isRtl ? <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transform group-hover:-translate-x-1 transition-all" /> : <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transform group-hover:translate-x-1 transition-all" />}
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
