'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import api from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import {
    Send, Paperclip, Search, MoreVertical, Phone, Video,
    ArrowLeft, ArrowRight, CheckCheck, Check, Loader2, User, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserType {
    _id: string; // The populate might return _id from backend
    id?: string; // or id if normalized
    name: string;
    avatar?: string;
}

interface Conversation {
    _id: string;
    participants: UserType[];
    lastMessage?: {
        content: string;
        sender: string;
        isRead: boolean;
        createdAt: string;
    };
    updatedAt: string;
}

interface Message {
    _id: string;
    conversationId: string;
    sender: UserType;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export default function MessagesPage() {
    const t = useTranslations('Messages');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, [user]);

    // Handle socket events
    useEffect(() => {
        if (!socket) return;

        socket.on('new-message', (data: { message: Message, conversationId: string }) => {
            // 1. If chat is open, append message
            if (activeConversation?._id === data.conversationId) {
                setMessages((prev) => [...prev, data.message]);
                // meaningful instant read mark could happen here
                socket.emit('mark-read', data.conversationId); // if backend supported it via socket, else API call
                api.put(`/messages/read/${data.conversationId}`).catch(console.error);
            }

            // 2. Update conversation list preview
            setConversations((prev) => {
                const other = prev.filter(c => c._id !== data.conversationId);
                const current = prev.find(c => c._id === data.conversationId);
                if (current) {
                    const updated = {
                        ...current,
                        lastMessage: {
                            content: data.message.content,
                            sender: data.message.sender._id,
                            isRead: false,
                            createdAt: data.message.createdAt
                        },
                        updatedAt: new Date().toISOString()
                    };
                    return [updated, ...other];
                } else {
                    // New conversation started by someone else? (Ideally we re-fetch or push new)
                    fetchConversations(); // lazy refresh
                    return prev;
                }
            });
        });

        return () => {
            socket.off('new-message');
        };
    }, [socket, activeConversation]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data.conversations);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversation: Conversation) => {
        setActiveConversation(conversation);
        setLoadingMessages(true);
        try {
            const res = await api.get(`/messages/${conversation._id}`);
            setMessages(res.data.messages);
            // Mark as read
            if (conversation.lastMessage && !conversation.lastMessage.isRead && conversation.lastMessage.sender !== user?.id) {
                await api.put(`/messages/read/${conversation._id}`);
                // Update local state to reflect read
                setConversations(prev => prev.map(c => {
                    if (c._id === conversation._id && c.lastMessage) {
                        return { ...c, lastMessage: { ...c.lastMessage, isRead: true } };
                    }
                    return c;
                }));
            }
        } catch (error) {
            toast.error(t('errorLoad'));
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeConversation) return;

        const tempId = Date.now().toString();
        const content = messageInput;
        setMessageInput(''); // Clear immediately for UX

        try {
            const res = await api.post('/messages', {
                conversationId: activeConversation._id,
                content
            });
            const newMessage = res.data.message;
            setMessages((prev) => [...prev, newMessage]);

            // Update conversation list
            setConversations((prev) => {
                const other = prev.filter(c => c._id !== activeConversation._id);
                const updated = {
                    ...activeConversation,
                    lastMessage: {
                        content,
                        sender: user?.id || '',
                        isRead: false,
                        createdAt: new Date().toISOString()
                    },
                    updatedAt: new Date().toISOString()
                };
                return [updated, ...other];
            });

        } catch (error) {
            toast.error(t('errorSend'));
            setMessageInput(content); // Restore if failed
        }
    };

    const getOtherParticipant = (c: Conversation) => {
        return c.participants.find(p => p._id !== user?.id && p.id !== user?.id) || c.participants[0];
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;
    }

    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-4 px-4 overflow-hidden flex flex-col">
            <div className="container mx-auto h-full max-w-6xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-full flex border border-gray-200 dark:border-gray-700">

                    {/* Sidebar / Conversation List */}
                    <div className={`w-full md:w-1/3 ${isRtl ? 'border-l' : 'border-r'} border-gray-200 dark:border-gray-700 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
                                <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full">
                                    {conversations.length}
                                </span>
                            </div>
                            <div className="relative">
                                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                                <input type="text" placeholder={t('searchPlaceholder')} className={`input ${isRtl ? 'pr-10' : 'pl-10'} text-sm py-2`} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {conversations.length === 0 ? (
                                <div className="text-center p-8 text-gray-400">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>{t('noConversations')}</p>
                                </div>
                            ) : (
                                conversations.map((c) => {
                                    const other = getOtherParticipant(c);
                                    const isUnread = c.lastMessage && !c.lastMessage.isRead && c.lastMessage.sender !== user?.id;

                                    return (
                                        <div key={c._id} onClick={() => loadMessages(c)}
                                            className={`p-4 border-b border-gray-50 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${activeConversation?._id === c._id ? `bg-primary-50 dark:bg-primary-900/10 border-${isRtl ? 'r' : 'l'}-4 border-${isRtl ? 'r' : 'l'}-primary-600` : ''
                                                }`}>
                                            <div className="flex items-start gap-3">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                        {other.name.charAt(0)}
                                                    </div>
                                                    {/* Online status indicator could go here */}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h3 className={`text-sm font-semibold truncate ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                            {other.name}
                                                        </h3>
                                                        <span className="text-xs text-gray-400 flex-shrink-0">
                                                            {c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }) : ''}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {c.lastMessage?.sender === user?.id && t('you')}
                                                        {c.lastMessage?.content || t('startChat')}
                                                    </p>
                                                </div>
                                                {isUnread && (
                                                    <div className="w-3 h-3 bg-primary-600 rounded-full mt-2 animate-pulse" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className={`w-full md:w-2/3 flex flex-col bg-slate-50 dark:bg-gray-900 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                        {activeConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                                            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {getOtherParticipant(activeConversation).name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{getOtherParticipant(activeConversation).name}</h3>
                                            {/* <span className="text-xs text-green-500 flex items-center gap-1">● متصل الآن</span> */}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-gray-400">
                                        {/* Actions placeholder */}
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Phone className="w-5 h-5" /></button>
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Video className="w-5 h-5" /></button>
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><MoreVertical className="w-5 h-5" /></button>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-gray-900" ref={scrollContainerRef}>
                                    {loadingMessages ? (
                                        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-20 text-gray-400">
                                            <p>{t('chatStart', { name: getOtherParticipant(activeConversation).name })}</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => {
                                            const isMe = msg.sender._id === user?.id || msg.sender.id === user?.id; // handle populate variations
                                            const nextMsg = messages[i + 1];
                                            const isSequence = nextMsg && (nextMsg.sender._id === msg.sender._id); // group bubbles

                                            return (
                                                <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm relative group ${isMe
                                                        ? 'bg-primary-600 text-white rounded-br-none'
                                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
                                                        }`}>
                                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70 ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                                                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            {isMe && (
                                                                msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Chat Input */}
                                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                        <button type="button" className="p-3 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl flex items-center px-4 py-2 border border-transparent focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all">
                                            <textarea
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                placeholder={t('typeMessage')}
                                                className="w-full bg-transparent border-none outline-none resize-none max-h-32 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                                                rows={1}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <button type="submit" disabled={!messageInput.trim()}
                                            className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 transform active:scale-95 transition-all">
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 bg-slate-50 dark:bg-gray-900/50">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                    <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">{t('selectConversation')}</h3>
                                <p className="mt-2 text-sm text-gray-500">{t('selectConversationDesc')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
