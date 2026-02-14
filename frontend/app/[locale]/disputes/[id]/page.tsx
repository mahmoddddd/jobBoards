'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Loader2, Send, Paperclip, ShieldAlert, CheckCircle,
    XCircle, Clock, ArrowRight, ArrowLeft, MessageSquare,
    AlertTriangle, Gavel
} from 'lucide-react';

interface Message {
    senderId: { _id: string; name: string };
    message: string;
    attachments: { name: string; url: string }[];
    createdAt: string;
}

interface Dispute {
    _id: string;
    contractId: { _id: string; title: string; totalAmount: number };
    initiatorId: { _id: string; name: string; avatar?: string };
    defendantId: { _id: string; name: string; avatar?: string };
    reason: string;
    evidence: { name: string; url: string }[];
    status: string;
    messages: Message[];
    finalDecision?: {
        decision: string;
        decidedBy: { name: string };
        decidedAt: string;
    };
    createdAt: string;
}

export default function DisputeDetailPage() {
    const t = useTranslations('Disputes');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const params = useParams();
    const { user } = useAuth();
    const [dispute, setDispute] = useState<Dispute | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (params.id) fetchDispute();
    }, [params.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dispute?.messages]);

    const fetchDispute = async () => {
        try {
            const res = await api.get(`/disputes/${params.id}`);
            setDispute(res.data.data.dispute);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dispute');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await api.post(`/disputes/${params.id}/messages`, {
                message: newMessage
            });
            setNewMessage('');
            fetchDispute();
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;

    if (!dispute) return (
        <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dispute not found</h2>
            <Link href="/" className="btn-primary">Home</Link>
        </div>
    );

    const statusMap: Record<string, { label: string, class: string, icon: any }> = {
        OPEN: { label: t('status.OPEN'), class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
        UNDER_REVIEW: { label: t('status.UNDER_REVIEW'), class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: ShieldAlert },
        RESOLVED: { label: t('status.RESOLVED'), class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
        REJECTED: { label: t('status.REJECTED'), class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle }
    };

    const statusInfo = statusMap[dispute.status] || statusMap.OPEN;
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <Link href={`/contracts/${dispute.contractId._id}`} className="inline-flex items-center gap-1 text-primary-600 hover:underline mb-2">
                            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {t('backToContract')}
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            {dispute.contractId.title} - {t('title')}
                        </h1>
                    </div>
                    <div className={`flex flex-col items-end gap-2`}>
                        <span className={`badge flex items-center gap-2 text-sm py-1.5 px-4 ${statusInfo.class}`}>
                            <StatusIcon className="w-4 h-4" /> {statusInfo.label}
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Panel: Chat and Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Dispute Detail Card */}
                        <div className="card p-6 bg-red-50/50 dark:bg-red-900/5 border-red-100 dark:border-red-900/20">
                            <h3 className="font-bold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2">
                                <Gavel className="w-5 h-5" /> {t('reason')}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{dispute.reason}</p>

                            {dispute.evidence?.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/20">
                                    <h4 className="text-sm font-semibold mb-2">{t('attachments')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {dispute.evidence.map((file, idx) => (
                                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors">
                                                <Paperclip className="w-3 h-3" /> {file.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Final Decision if Resolved */}
                        {dispute.finalDecision && (
                            <div className="card p-6 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                                <h3 className="font-bold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> {t('finalDecision')}
                                </h3>
                                <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">{dispute.finalDecision.decision}</p>
                                <p className="text-xs text-green-600 dark:text-green-500">
                                    {t('decidedBy')} {dispute.finalDecision.decidedBy.name} • {new Date(dispute.finalDecision.decidedAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}

                        {/* Message History */}
                        <div className="card flex flex-col h-[500px]">
                            <div className="p-4 border-b dark:border-gray-700 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white">{t('messages')}</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {dispute.messages.map((msg, idx) => {
                                    const isMe = msg.senderId._id === user?.id;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe
                                                    ? 'bg-primary-600 text-white rounded-br-none'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                                                }`}>
                                                {!isMe && <div className="text-[10px] font-bold opacity-75 mb-1">{msg.senderId.name}</div>}
                                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                <div className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Input */}
                            {(dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW') && (
                                <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={t('placeholder')}
                                            className="flex-1 input bg-white"
                                        />
                                        <button type="submit" disabled={sending || !newMessage.trim()} className="btn-primary p-2 w-12 flex items-center justify-center">
                                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Parties & Info */}
                    <div className="space-y-6">
                        <div className="card p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">اطراف النزاع</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">{t('openedBy')}</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                                            {dispute.initiatorId.name.charAt(0)}
                                        </div>
                                        <div className="font-medium text-gray-900 dark:text-white truncate">{dispute.initiatorId.name}</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t dark:border-gray-700">
                                    <div className="text-xs text-gray-500 mb-1">{t('defendant')}</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 text-sm">
                                            {dispute.defendantId.name.charAt(0)}
                                        </div>
                                        <div className="font-medium text-gray-900 dark:text-white truncate">{dispute.defendantId.name}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 bg-primary-50 dark:bg-primary-900/5 border-primary-100 dark:border-primary-900/20">
                            <h4 className="font-bold text-primary-800 dark:text-primary-400 mb-2 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5" /> ملاحظة
                            </h4>
                            <p className="text-sm text-primary-700 dark:text-primary-300 leading-relaxed">
                                سيقوم فريق الدعم بمراجعة الأدلة المقدمة والمحادثات بين الطرفين للفصل في هذا النزاع بشكل عادل. برجاء تقديم أي ملفات توضيحية إضافية في المحادثة.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
