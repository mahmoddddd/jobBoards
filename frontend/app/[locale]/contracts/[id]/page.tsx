'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Loader2, ArrowRight, ArrowLeft, DollarSign, CheckCircle, Clock, Upload,
    AlertCircle, Plus, XCircle, FileText, User, Star
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface Milestone {
    _id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
    deliverables: { name: string; url: string }[];
    submittedAt: string;
    approvedAt: string;
}

interface ContractDetail {
    _id: string;
    title: string;
    description: string;
    totalAmount: number;
    status: string;
    progress: number;
    projectId: { _id: string; title: string; description: string; category: string };
    clientId: { _id: string; name: string; email: string };
    freelancerId: { _id: string; name: string; email: string };
    milestones: Milestone[];
    startDate: string;
    endDate: string;
    createdAt: string;
}

const getMilestoneStatusMap = (t: any) => {
    const map: Record<string, { label: string; class: string; icon: any }> = {
        PENDING: { label: t('status.PENDING'), class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', icon: Clock },
        IN_PROGRESS: { label: t('status.IN_PROGRESS'), class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
        SUBMITTED: { label: t('status.SUBMITTED'), class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Upload },
        APPROVED: { label: t('status.APPROVED'), class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
        REVISION_REQUESTED: { label: t('status.REVISION_REQUESTED'), class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle },
        PAID: { label: t('status.PAID'), class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: DollarSign },
    };
    return map;
};

export default function ContractDetailPage() {
    const t = useTranslations('Contracts');
    const ta = useTranslations('Auth');
    const tj = useTranslations('Jobs');
    const tr = useTranslations('CompanyReviews');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const params = useParams();
    const { user } = useAuth();
    const [contract, setContract] = useState<ContractDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddMilestone, setShowAddMilestone] = useState(false);
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
    const [newMilestoneAmount, setNewMilestoneAmount] = useState('');
    const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const isClient = contract && user && contract.clientId._id === user.id;
    const isFreelancer = contract && user && contract.freelancerId._id === user.id;

    useEffect(() => { if (params.id) fetchContract(); }, [params.id]);

    const fetchContract = async () => {
        try {
            const res = await api.get(`/contracts/${params.id}`);
            setContract(res.data.contract);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const addMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/contracts/${params.id}/milestones`, {
                title: newMilestoneTitle,
                description: newMilestoneDesc,
                amount: parseFloat(newMilestoneAmount)
            });
            toast.success('تمت إضافة المرحلة');
            setShowAddMilestone(false);
            setNewMilestoneTitle(''); setNewMilestoneAmount(''); setNewMilestoneDesc('');
            fetchContract();
        } catch (error: any) { toast.error(error.response?.data?.message || 'حدث خطأ'); }
    };

    const updateMilestone = async (milestoneId: string, status: string) => {
        try {
            await api.put(`/contracts/${params.id}/milestones/${milestoneId}`, { status });
            toast.success('تم تحديث المرحلة');
            fetchContract();
        } catch (error: any) { toast.error(error.response?.data?.message || 'حدث خطأ'); }
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contract) return;
        setReviewSubmitting(true);
        try {
            await api.post(`/reviews`, {
                contractId: contract._id,
                freelancerId: contract.freelancerId._id,
                rating,
                comment: reviewComment,
            });
            toast.success('تم إرسال التقييم بنجاح!');
            setShowReviewModal(false);
            setRating(5);
            setReviewComment('');
            fetchContract(); // Re-fetch contract to update status if needed
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل إرسال التقييم.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;
    }

    if (!contract) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('notFound')}</h2>
                <Link href="/contracts" className="btn-primary">{t('title')}</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/contracts" className={`inline-flex items-center gap-1 text-primary-600 hover:underline mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />} {t('backToContracts')}
                </Link>

                {/* Header Card */}
                <div className="card p-6 mb-6">
                    <div className={`flex items-start justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{contract.title}</h1>
                            <p className="text-gray-500 mt-1">
                                {t('createdDate')}: {new Date(contract.startDate).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                            </p>
                        </div>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                            <div className={`text-2xl font-bold text-green-600 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <DollarSign className="w-6 h-6" /> {contract.totalAmount.toLocaleString()}
                            </div>
                            <div className={`flex flex-col gap-2 mt-2 ${isRtl ? 'items-start' : 'items-end'}`}>
                                <span className={`badge text-sm ${contract.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    contract.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {t(`status.${contract.status}`)}
                                </span>
                                {isClient && contract.status === 'COMPLETED' && (
                                    <button onClick={() => setShowReviewModal(true)} className={`btn-primary text-xs flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <Star className="w-4 h-4" /> {t('completeContract')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className={`flex justify-between text-sm mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <span className="text-gray-600 dark:text-gray-400">{t('progress')}</span>
                            <span className="font-bold text-primary-600">{contract.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className={`${isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500`}
                                style={{ width: `${contract.progress}%` }} />
                        </div>
                    </div>

                    <div className={`grid md:grid-cols-2 gap-4 mt-5 pt-5 border-t dark:border-gray-700 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                                <div className="text-xs text-gray-500">{t('parties.client')}</div>
                                <div className="font-medium text-gray-900 dark:text-white">{contract.clientId.name}</div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                                <div className="text-xs text-gray-500">{t('parties.freelancer')}</div>
                                <div className="font-medium text-gray-900 dark:text-white">{contract.freelancerId.name}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Milestones */}
                <div className="card p-6">
                    <div className={`flex items-center justify-between mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <h2 className={`text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <FileText className="w-5 h-5 text-primary-600" /> {t('milestones')} ({contract.milestones.length})
                        </h2>
                        {isClient && contract.status === 'ACTIVE' && (
                            <button onClick={() => setShowAddMilestone(true)} className="text-primary-600 text-sm flex items-center gap-1 hover:underline">
                                <Plus className="w-4 h-4" /> {t('addMilestone')}
                            </button>
                        )}
                    </div>

                    {/* Add Milestone Form */}
                    {showAddMilestone && (
                        <form onSubmit={addMilestone} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 mb-6 border border-gray-200 dark:border-gray-700">
                            <div className="grid md:grid-cols-2 gap-3 mb-3">
                                <input type="text" value={newMilestoneTitle} onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                    className={`input text-sm ${isRtl ? 'text-right' : 'text-left'}`} placeholder={t('milestoneTitle')} required />
                                <input type="number" value={newMilestoneAmount} onChange={(e) => setNewMilestoneAmount(e.target.value)}
                                    className={`input text-sm ${isRtl ? 'text-right' : 'text-left'}`} placeholder={t('amount')} required min="0" />
                            </div>
                            <textarea value={newMilestoneDesc} onChange={(e) => setNewMilestoneDesc(e.target.value)}
                                className={`input text-sm mb-3 ${isRtl ? 'text-right' : 'text-left'}`} placeholder={t('description')} rows={2} />
                            <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <button type="submit" className="btn-primary text-sm py-2">{t('add')}</button>
                                <button type="button" onClick={() => setShowAddMilestone(false)} className="btn-secondary text-sm py-2">{ta('cancel')}</button>
                            </div>
                        </form>
                    )}

                    {/* Milestone Timeline */}
                    <div className="space-y-4">
                        {contract.milestones.map((m, i) => {
                            const milestoneStatusMap = getMilestoneStatusMap(t);
                            const statusInfo = milestoneStatusMap[m.status] || milestoneStatusMap.PENDING;
                            const StatusIcon = statusInfo.icon;
                            return (
                                <div key={m._id} className="relative">
                                    {/* Timeline connector */}
                                    {i < contract.milestones.length - 1 && (
                                        <div className={`absolute top-12 ${isRtl ? 'right-5' : 'left-5'} w-0.5 h-full bg-gray-200 dark:bg-gray-700`} />
                                    )}
                                    <div className={`flex gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        {/* Timeline dot */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${['APPROVED', 'PAID'].includes(m.status) ? 'bg-green-500 text-white' :
                                            m.status === 'SUBMITTED' ? 'bg-yellow-500 text-white' :
                                                'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                            }`}>
                                            <StatusIcon className="w-5 h-5" />
                                        </div>
                                        {/* Content */}
                                        <div className={`flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 ${isRtl ? 'text-right' : 'text-left'}`}>
                                            <div className={`flex items-start justify-between mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                <div className={isRtl ? 'text-right' : 'text-left'}>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{m.title}</h4>
                                                    {m.description && <p className="text-sm text-gray-500 mt-1">{m.description}</p>}
                                                </div>
                                                <div className={isRtl ? 'text-right' : 'text-left'}>
                                                    <div className="font-bold text-green-600">${m.amount.toLocaleString()}</div>
                                                    <span className={`badge text-xs ${statusInfo.class}`}>{statusInfo.label}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className={`flex gap-2 mt-3 pt-3 border-t dark:border-gray-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                {/* Freelancer: submit */}
                                                {isFreelancer && ['PENDING', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(m.status) && (
                                                    <button onClick={() => updateMilestone(m._id, 'SUBMITTED')}
                                                        className={`btn-primary text-xs py-1.5 px-3 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                        <Upload className="w-3 h-3" /> {t('submit')}
                                                    </button>
                                                )}
                                                {/* Client: approve */}
                                                {isClient && m.status === 'SUBMITTED' && (
                                                    <>
                                                        <button onClick={() => updateMilestone(m._id, 'APPROVED')}
                                                            className={`btn-primary text-xs py-1.5 px-3 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                            <CheckCircle className="w-3 h-3" /> {t('approve')}
                                                        </button>
                                                        <button onClick={() => updateMilestone(m._id, 'REVISION_REQUESTED')}
                                                            className={`btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                            <AlertCircle className="w-3 h-3" /> {t('revision')}
                                                        </button>
                                                    </>
                                                )}
                                                {/* Client: pay */}
                                                {isClient && m.status === 'APPROVED' && (
                                                    <button onClick={() => updateMilestone(m._id, 'PAID')}
                                                        className={`btn-success text-xs py-1.5 px-3 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                        <DollarSign className="w-3 h-3" /> {t('pay')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Review Modal */}
                {showReviewModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className={`bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in relative ${isRtl ? 'text-right' : 'text-left'}`}>
                            <button onClick={() => setShowReviewModal(false)} className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} text-gray-400 hover:text-gray-600`}>
                                <XCircle className="w-6 h-6" />
                            </button>
                            <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> {t('completeContract')}
                            </h3>
                            <form onSubmit={submitReview} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>{tr('rating')}</label>
                                    <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                                <Star className={`w-8 h-8 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>{tr('comment')}</label>
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        className={`input min-h-[100px] ${isRtl ? 'text-right' : 'text-left'}`}
                                        placeholder={tr('commentPlaceholder')}
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={reviewSubmitting} className={`btn-primary w-full flex items-center justify-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    {reviewSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                    {tr('send')}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
