'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { disputesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import {
    ShieldAlert, Loader2, CheckCircle, XCircle, Clock, ArrowLeft,
    MessageCircle, FileText, Gavel, User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DisputeDetail {
    _id: string;
    contractId: { _id: string; title: string; totalAmount: number };
    initiatorId: { _id: string; name: string; email: string; avatar: string };
    defendantId: { _id: string; name: string; email: string; avatar: string };
    reason: string;
    evidence: string;
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
    messages: {
        senderId: string;
        message: string;
        createdAt: string;
    }[];
    finalDecision?: {
        decision: string;
        resultStatus: string;
        decidedAt: string;
    };
    createdAt: string;
}

export default function AdminDisputeDetailPage() {
    const t = useTranslations('Disputes');
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [dispute, setDispute] = useState<DisputeDetail | null>(null);

    // Resolution state
    const [decision, setDecision] = useState('');
    const [action, setAction] = useState('RESOLVED'); // RESOLVED, REJECTED
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchDispute();
        } else if (user && user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, id]);

    const fetchDispute = async () => {
        setLoading(true);
        try {
            const res = await disputesAPI.getOne(id);
            setDispute(res.data.data.dispute);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching dispute details');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to resolve this dispute? This action cannot be undone.')) return;

        setResolving(true);
        try {
            await disputesAPI.resolve(id, {
                decision,
                resultStatus: action
            });
            toast.success('Dispute resolved successfully');
            fetchDispute();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error resolving dispute');
        } finally {
            setResolving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;
    if (!dispute) return <div className="p-12 text-center">Dispute not found</div>;

    const isResolved = ['RESOLVED', 'REJECTED'].includes(dispute.status);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
            <div className="container mx-auto px-4 max-w-5xl">

                <Link href="/admin/disputes" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Disputes
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Status Card */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <ShieldAlert className="text-red-600" />
                                    Dispute #{dispute._id.slice(-6)}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${dispute.status === 'OPEN' ? 'bg-blue-100 text-blue-600' :
                                        dispute.status === 'RESOLVED' ? 'bg-green-100 text-green-600' :
                                            dispute.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {dispute.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mt-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-gray-500">Contract</p>
                                    <p className="font-semibold">{dispute.contractId.title}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Amount</p>
                                    <p className="font-semibold">${dispute.contractId.totalAmount}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Created At</p>
                                    <p className="font-semibold">{new Date(dispute.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-500" /> Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500">Reason</label>
                                    <p className="font-medium bg-gray-50 p-3 rounded-lg mt-1">{dispute.reason}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Evidence / Description</label>
                                    <p className="font-medium whitespace-pre-wrap bg-gray-50 p-3 rounded-lg mt-1">{dispute.evidence}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-gray-500" /> Messages history
                            </h3>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {dispute.messages.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">No messages exchanged.</p>
                                ) : (
                                    dispute.messages.map((msg, idx) => {
                                        const isInitiator = msg.senderId === dispute.initiatorId._id;
                                        const sender = isInitiator ? dispute.initiatorId : dispute.defendantId;
                                        return (
                                            <div key={idx} className={`flex gap-3 ${isInitiator ? 'flex-row' : 'flex-row-reverse'}`}>
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                                    {sender.name[0]}
                                                </div>
                                                <div className={`p-3 rounded-xl max-w-[80%] ${isInitiator ? 'bg-blue-50 text-blue-900 rounded-tl-none' : 'bg-gray-100 text-gray-900 rounded-tr-none'}`}>
                                                    <p className="text-xs font-bold mb-1 opacity-70">{sender.name}</p>
                                                    <p className="text-sm">{msg.message}</p>
                                                    <p className="text-[10px] mt-1 opacity-50 text-right">
                                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar: Parties & Action */}
                    <div className="space-y-6">
                        {/* Parties */}
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" /> Parties
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                        {dispute.initiatorId.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs text-red-600 font-bold uppercase">Initiator</p>
                                        <p className="font-medium">{dispute.initiatorId.name}</p>
                                        <p className="text-xs text-gray-500">{dispute.initiatorId.email}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100"></div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {dispute.defendantId.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 font-bold uppercase">Defendant</p>
                                        <p className="font-medium">{dispute.defendantId.name}</p>
                                        <p className="text-xs text-gray-500">{dispute.defendantId.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Action */}
                        <div className="card p-6 bg-gray-50 border-2 border-dashed border-gray-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-gray-500" /> Resolution
                            </h3>

                            {isResolved ? (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">Status</p>
                                    <p className={`font-bold mb-3 ${dispute.status === 'RESOLVED' ? 'text-green-600' : 'text-red-600'}`}>
                                        {dispute.status}
                                    </p>

                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">Decision</p>
                                    <p className="text-sm bg-gray-50 p-2 rounded border">{dispute.finalDecision?.decision}</p>

                                    <p className="text-xs text-gray-400 mt-2">
                                        Decided on {dispute.finalDecision?.decidedAt ? new Date(dispute.finalDecision.decidedAt).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleResolve} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Decision Note</label>
                                        <textarea
                                            value={decision}
                                            onChange={(e) => setDecision(e.target.value)}
                                            className="input"
                                            rows={4}
                                            placeholder="Explain the resolution details..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Outcome</label>
                                        <select
                                            value={action}
                                            onChange={(e) => setAction(e.target.value)}
                                            className="input"
                                        >
                                            <option value="RESOLVED">Mark as RESOLVED</option>
                                            <option value="REJECTED">Reject/Dismiss Dispute</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={resolving || !decision}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
                                        Submit Resolution
                                    </button>
                                </form>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
