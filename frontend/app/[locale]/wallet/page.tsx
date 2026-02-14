'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle, History,
    Loader2, XCircle, CheckCircle, Clock, AlertCircle, DollarSign
} from 'lucide-react';

interface Transaction {
    _id: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'EARNING' | 'REFUND';
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    description: string;
    createdAt: string;
}

export default function WalletPage() {
    const t = useTranslations('Wallet');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Modals
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    // Withdraw details
    const [withdrawMethod, setWithdrawMethod] = useState('PAYPAL');
    const [withdrawDetails, setWithdrawDetails] = useState('');

    useEffect(() => {
        if (user) fetchWallet();
    }, [user]);

    const fetchWallet = async () => {
        try {
            const res = await api.get('/wallet');
            setBalance(res.data.data.balance);
            setTransactions(res.data.data.transactions);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post('/wallet/deposit', { amount: parseFloat(amount) });
            toast.success(t('depositModal.confirm')); // Ideally success message
            setShowDepositModal(false);
            setAmount('');
            fetchWallet();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error');
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post('/wallet/withdraw', {
                amount: parseFloat(amount),
                method: withdrawMethod,
                details: withdrawDetails
            });
            toast.success(t('withdrawModal.confirm')); // Ideally success message
            setShowWithdrawModal(false);
            setAmount('');
            setWithdrawDetails('');
            fetchWallet();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;

    const getStatusInfo = (status: string) => {
        const map: any = {
            PENDING: { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
            COMPLETED: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
            FAILED: { color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
            CANCELLED: { color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300', icon: XCircle },
        };
        return map[status] || map.PENDING;
    };

    const getTypeInfo = (type: string) => {
        const map: any = {
            DEPOSIT: { color: 'text-green-600', icon: ArrowDownCircle },
            EARNING: { color: 'text-green-600', icon: DollarSign },
            WITHDRAWAL: { color: 'text-red-500', icon: ArrowUpCircle },
            PAYMENT: { color: 'text-red-500', icon: ArrowUpCircle },
            REFUND: { color: 'text-green-600', icon: ArrowDownCircle },
        };
        return map[type] || map.DEPOSIT;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className={`flex flex-col md:flex-row items-center justify-between gap-6 mb-8 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-primary-600" /> {t('title')}
                        </h1>
                        <p className="text-gray-500 mt-2">{t('balance')}</p>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transform rotate-45 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-primary-100 mb-1 font-medium">{t('available')}</p>
                            <div className="text-4xl md:text-5xl font-bold tracking-tight">
                                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 border border-white/10"
                            >
                                <ArrowDownCircle className="w-5 h-5" /> {t('deposit')}
                            </button>
                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                className="bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
                            >
                                <ArrowUpCircle className="w-5 h-5" /> {t('withdraw')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transactions */}
                <div className="card overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-500" /> {t('history')}
                        </h2>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t('noTransactions')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">{t('type')}</th>
                                        <th className="px-6 py-4">{t('description')}</th>
                                        <th className="px-6 py-4">{t('date')}</th>
                                        <th className="px-6 py-4">{t('status')}</th>
                                        <th className={`px-6 py-4 ${isRtl ? 'text-left' : 'text-right'}`}>{t('amount')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-300">
                                    {transactions.map((tx) => {
                                        const statusInfo = getStatusInfo(tx.status);
                                        const typeInfo = getTypeInfo(tx.type);
                                        const TypeIcon = typeInfo.icon;
                                        const StatusIcon = statusInfo.icon;

                                        return (
                                            <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-2 font-medium ${typeInfo.color}`}>
                                                        <TypeIcon className="w-4 h-4" />
                                                        {t(`types.${tx.type}`)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                    {tx.description}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(tx.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {t(`statuses.${tx.status}`)}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 font-bold ${isRtl ? 'text-left' : 'text-right'} ${['WITHDRAWAL', 'PAYMENT'].includes(tx.type) ? 'text-red-500' : 'text-green-600'
                                                    }`}>
                                                    {['WITHDRAWAL', 'PAYMENT'].includes(tx.type) ? '-' : '+'}
                                                    ${tx.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Deposit Modal */}
                {showDepositModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                            <button
                                onClick={() => setShowDepositModal(false)}
                                className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600`}
                            >
                                <XCircle className="w-6 h-6" />
                            </button>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-primary-600" />
                                {t('depositModal.title')}
                            </h3>

                            <form onSubmit={handleDeposit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('depositModal.amount')}
                                    </label>
                                    <div className="relative">
                                        <DollarSign className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className={`input ${isRtl ? 'pr-10' : 'pl-10'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                                >
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowDownCircle className="w-5 h-5" />}
                                    {t('depositModal.confirm')}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Withdraw Modal */}
                {showWithdrawModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600`}
                            >
                                <XCircle className="w-6 h-6" />
                            </button>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-primary-600" />
                                {t('withdrawModal.title')}
                            </h3>

                            <form onSubmit={handleWithdraw} className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('withdrawModal.amount')}
                                        </label>
                                        <span className="text-xs text-primary-600 font-medium">
                                            {t('available')}: ${balance.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <DollarSign className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                                        <input
                                            type="number"
                                            min="1"
                                            max={balance}
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className={`input ${isRtl ? 'pr-10' : 'pl-10'}`}
                                            required
                                        />
                                    </div>
                                    {parseFloat(amount) > balance && (
                                        <p className="text-red-500 text-xs mt-1">{t('withdrawModal.insufficient')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('withdrawModal.method')}
                                    </label>
                                    <select
                                        value={withdrawMethod}
                                        onChange={(e) => setWithdrawMethod(e.target.value)}
                                        className="input"
                                    >
                                        <option value="PAYPAL">PayPal</option>
                                        <option value="BANK">Bank Transfer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('withdrawModal.details')}
                                    </label>
                                    <textarea
                                        value={withdrawDetails}
                                        onChange={(e) => setWithdrawDetails(e.target.value)}
                                        className="input"
                                        placeholder={withdrawMethod === 'PAYPAL' ? 'email@example.com' : 'Bank Name, Account Number, SWIFT...'}
                                        required
                                        rows={3}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || parseFloat(amount) > balance || !amount}
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                                >
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpCircle className="w-5 h-5" />}
                                    {t('withdrawModal.confirm')}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
