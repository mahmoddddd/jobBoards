'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { disputesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import {
    ShieldAlert, Loader2, CheckCircle, XCircle, Clock, Eye,
    Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Dispute {
    _id: string;
    contractId: { _id: string; title: string };
    initiatorId: { _id: string; name: string; email: string };
    defendantId: { _id: string; name: string; email: string };
    reason: string;
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
    createdAt: string;
}

export default function AdminDisputesPage() {
    const t = useTranslations('Disputes');
    const { user } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [loading, setLoading] = useState(true);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchDisputes();
        } else if (user && user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, filterStatus]);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterStatus) params.status = filterStatus;

            const res = await disputesAPI.getAll(params);
            setDisputes(res.data.data.disputes);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching disputes');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        const map: any = {
            OPEN: { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', icon: ShieldAlert, label: t('status.OPEN') },
            UNDER_REVIEW: { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: t('status.UNDER_REVIEW') },
            RESOLVED: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: t('status.RESOLVED') },
            REJECTED: { color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: t('status.REJECTED') },
        };
        return map[status] || map.OPEN;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
            <div className="container mx-auto px-4 max-w-6xl">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8 text-red-600" />
                            {t('title')} (Admin)
                        </h1>
                        <p className="text-gray-500 mt-2">Manage and resolve user disputes</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input md:w-48"
                        >
                            <option value="">{t('status.OPEN')}/{t('status.UNDER_REVIEW')} (All)</option>
                            <option value="OPEN">Open</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="card p-12 text-center text-gray-500">
                        <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                        <p>{t('noDisputes')}</p>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">{t('reason')}</th>
                                        <th className="px-6 py-4">{t('openedBy')}</th>
                                        <th className="px-6 py-4">{t('defendant')}</th>
                                        <th className="px-6 py-4">{t('status.OPEN')}</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-300">
                                    {disputes.map((dispute) => {
                                        const statusInfo = getStatusInfo(dispute.status);
                                        const StatusIcon = statusInfo.icon;

                                        return (
                                            <tr key={dispute._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="truncate max-w-xs" title={dispute.reason}>
                                                        {dispute.contractId?.title || 'Unknown Contract'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                                        {dispute.reason}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">{dispute.initiatorId.name}</div>
                                                    <div className="text-xs text-gray-500">{dispute.initiatorId.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">{dispute.defendantId.name}</div>
                                                    <div className="text-xs text-gray-500">{dispute.defendantId.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(dispute.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={`/admin/disputes/${dispute._id}`}
                                                        className="btn-secondary py-1.5 px-3 text-xs flex items-center justify-center gap-1"
                                                    >
                                                        <Eye className="w-3 h-3" /> View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
