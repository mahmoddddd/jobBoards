'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/navigation';
import {
    DollarSign, Clock, Users, Star, MapPin, ArrowRight, Loader2,
    Code, Smartphone, Palette, PenTool, Megaphone, Database, Video,
    Music, Briefcase, MoreHorizontal, Send, CheckCircle, XCircle, AlertCircle, ArrowLeft
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface Project {
    _id: string;
    title: string;
    description: string;
    clientId: { _id: string; name: string; createdAt: string };
    companyId?: { name: string; logo: string };
    category: string;
    skills: string[];
    budgetType: string;
    budgetMin: number;
    budgetMax: number;
    duration: string;
    experienceLevel: string;
    status: string;
    proposalCount: number;
    createdAt: string;
}

interface Proposal {
    _id: string;
    freelancerId: { _id: string; name: string; email: string };
    coverLetter: string;
    bidAmount: number;
    estimatedDuration: string;
    status: string;
    createdAt: string;
}

// Maps moved inside component to use translations


export default function ProjectDetailPage() {
    const t = useTranslations('ProjectDetail');
    const tp = useTranslations('Projects');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const categoryMap: Record<string, { label: string; icon: any }> = {
        WEB_DEVELOPMENT: { label: tp('categories.WEB_DEVELOPMENT'), icon: Code },
        MOBILE_DEVELOPMENT: { label: tp('categories.MOBILE_DEVELOPMENT'), icon: Smartphone },
        DESIGN: { label: tp('categories.DESIGN'), icon: Palette },
        WRITING: { label: tp('categories.WRITING'), icon: PenTool },
        MARKETING: { label: tp('categories.MARKETING'), icon: Megaphone },
        DATA_SCIENCE: { label: tp('categories.DATA_SCIENCE'), icon: Database },
        VIDEO_ANIMATION: { label: tp('categories.VIDEO_ANIMATION'), icon: Video },
        MUSIC_AUDIO: { label: tp('categories.MUSIC_AUDIO'), icon: Music },
        BUSINESS: { label: tp('categories.BUSINESS'), icon: Briefcase },
        OTHER: { label: tp('categories.OTHER'), icon: MoreHorizontal },
    };

    const durationMap: Record<string, string> = {
        LESS_THAN_1_WEEK: tp('durations.LESS_THAN_1_WEEK'),
        LESS_THAN_1_MONTH: tp('durations.LESS_THAN_1_MONTH'),
        '1_TO_3_MONTHS': tp('durations.1_TO_3_MONTHS'),
        '3_TO_6_MONTHS': tp('durations.3_TO_6_MONTHS'),
        MORE_THAN_6_MONTHS: tp('durations.MORE_THAN_6_MONTHS'),
    };

    const experienceMap: Record<string, string> = {
        ENTRY: tp('experience.ENTRY'),
        MID: tp('experience.MID'),
        SENIOR: tp('experience.SENIOR'),
        EXPERT: tp('experience.EXPERT'),
    };

    const statusMap: Record<string, { label: string; class: string }> = {
        OPEN: { label: t('status.OPEN'), class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
        IN_PROGRESS: { label: t('status.IN_PROGRESS'), class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        COMPLETED: { label: t('status.COMPLETED'), class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
        CANCELLED: { label: t('status.CANCELLED'), class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };

    const params = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProposalForm, setShowProposalForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Proposal form
    const [coverLetter, setCoverLetter] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState('LESS_THAN_1_MONTH');

    const isOwner = project && user && project.clientId._id === user.id;

    useEffect(() => {
        if (params.id) fetchProject();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${params.id}`);
            setProject(res.data.project);

            // Load proposals if owner
            try {
                const propRes = await api.get(`/proposals/project/${params.id}`);
                setProposals(propRes.data.proposals);
            } catch { }
        } catch (error) {
            console.error(error);
        } finally { setLoading(false); }
    };

    const submitProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { toast.error(t('messages.loginFirst')); return; }
        setSubmitting(true);
        try {
            await api.post('/proposals', {
                projectId: params.id,
                coverLetter,
                bidAmount: parseFloat(bidAmount),
                estimatedDuration
            });
            toast.success(t('messages.proposalSuccess'));
            setShowProposalForm(false);
            setCoverLetter(''); setBidAmount('');
            fetchProject();
        } catch (error: any) {
            toast.error(error.response?.data?.message || tp('error'));
        } finally { setSubmitting(false); }
    };

    const handleProposalAction = async (proposalId: string, status: string) => {
        try {
            await api.put(`/proposals/${proposalId}/status`, { status });
            toast.success(status === 'ACCEPTED' ? t('messages.acceptSuccess') : t('messages.rejectSuccess'));
            fetchProject();
        } catch (error: any) {
            toast.error(error.response?.data?.message || tp('error'));
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;
    }

    if (!project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('notFound')}</h2>
                <Link href="/projects" className="btn-primary">{tp('title')}</Link>
            </div>
        );
    }

    const catInfo = categoryMap[project.category] || categoryMap.OTHER;
    const CatIcon = catInfo.icon;
    const statusInfo = statusMap[project.status] || statusMap.OPEN;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-5xl">
                <Link href="/projects" className="inline-flex items-center gap-1 text-primary-600 hover:underline mb-6">
                    {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {t('backToProjects')}
                </Link>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="card p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                                <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 flex items-center gap-1">
                                    <CatIcon className="w-3 h-3" />{catInfo.label}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(project.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">{project.title}</h1>
                            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{project.description}</p>

                            {project.skills.length > 0 && (
                                <div className={`flex flex-wrap gap-1.5 md:gap-2 mt-5 pt-5 border-t dark:border-gray-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    {project.skills.map((s, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs md:text-sm">{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Proposal (for non-owners) */}
                        {!isOwner && project.status === 'OPEN' && user && (
                            <div className="card p-6">
                                {!showProposalForm ? (
                                    <button onClick={() => setShowProposalForm(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                                        <Send className="w-5 h-5" /> {t('submitProposal')}
                                    </button>
                                ) : (
                                    <form onSubmit={submitProposal} className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('yourProposal')}</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('coverLetter')}</label>
                                            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                                                className="input min-h-[120px]" placeholder={t('coverLetterPlaceholder')} required maxLength={3000} />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('bidAmount')}</label>
                                                <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                                                    className="input" placeholder="250" required min="1" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('estimatedDuration')}</label>
                                                <select value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} className="input">
                                                    {Object.entries(durationMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm md:text-base font-bold shadow-soft">
                                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                                {submitting ? t('sending') : t('sendProposal')}
                                            </button>
                                            <button type="button" onClick={() => setShowProposalForm(false)} className="btn-secondary py-3 text-sm md:text-base">{tp('cancel')}</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Proposals (for owner) */}
                        {isOwner && proposals.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary-600" /> {t('proposalsCount', { n: proposals.length })}
                                </h3>
                                <div className="space-y-4">
                                    {proposals.map((prop) => (
                                        <div key={prop._id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                                                        {prop.freelancerId?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">{prop.freelancerId?.name}</div>
                                                        <div className="text-xs text-gray-500">{new Date(prop.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</div>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-lg font-bold text-green-600">${prop.bidAmount}</div>
                                                    <div className="text-xs text-gray-500">{durationMap[prop.estimatedDuration]}</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{prop.coverLetter}</p>
                                            {prop.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleProposalAction(prop._id, 'ACCEPTED')}
                                                        className="flex-1 btn-primary text-sm flex items-center justify-center gap-1 py-2">
                                                        <CheckCircle className="w-4 h-4" /> {t('accept')}
                                                    </button>
                                                    <button onClick={() => handleProposalAction(prop._id, 'REJECTED')}
                                                        className="flex-1 btn-danger-outline text-sm flex items-center justify-center gap-1 py-2">
                                                        <XCircle className="w-4 h-4" /> {t('reject')}
                                                    </button>
                                                </div>
                                            )}
                                            {prop.status !== 'PENDING' && (
                                                <span className={`badge text-xs ${prop.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {prop.status === 'ACCEPTED' ? t('proposalAccepted') : t('proposalRejected')}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="card p-5">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t('details')}</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-500">{t('budget')}</div>
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            ${project.budgetMin || 0} – ${project.budgetMax || 0}
                                        </div>
                                        <div className="text-xs text-gray-500">{project.budgetType === 'FIXED' ? tp('fixedPrice') : tp('hourly')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-500">{t('estimatedDuration')}</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{durationMap[project.duration]}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-500">{tp('experienceLevel')}</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{experienceMap[project.experienceLevel]}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-500">{t('proposals')}</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{t('proposalsLabel', { n: project.proposalCount })}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="card p-5">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3">{t('aboutClient')}</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                                    {project.clientId?.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{project.clientId?.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {t('memberSince', { date: new Date(project.clientId?.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short' }) })}
                                    </div>
                                </div>
                            </div>
                            {project.companyId?.name && (
                                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                    <Briefcase className="w-4 h-4 inline ml-1" /> {project.companyId.name}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
