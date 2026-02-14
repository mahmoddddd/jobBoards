'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Bell, X, Check } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationBell() {
    const t = useTranslations('Notifications');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        // Close on click outside
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications?limit=5');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications');
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            setLoading(true);
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read');
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'APPLICATION_RECEIVED':
            case 'APPLICATION_STATUS':
                return '📝';
            case 'JOB_APPROVED':
                return '✅';
            case 'JOB_REJECTED':
            case 'COMPANY_BLOCKED':
                return '⚠️';
            case 'COMPANY_APPROVED':
                return '🎉';
            default:
                return '📢';
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className={`absolute top-1 ${isRtl ? 'left-1' : 'right-1'} w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse`} />
                )}
            </button>

            {isOpen && (
                <div className={`absolute top-12 ${isRtl ? 'right-0' : 'left-0'} w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in`}>
                    <div className={`p-4 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t('title')}</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                            >
                                {t('markAllAsRead')}
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-sm">{t('noNotifications')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.isRead ? 'bg-blue-50/50 dark:bg-primary-900/10' : ''
                                            }`}
                                    >
                                        <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                            <div className="text-xl mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`flex items-start justify-between gap-2 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                                    <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            className="text-gray-400 hover:text-primary-600 mt-1"
                                                            title={t('markAsRead')}
                                                        >
                                                            <div className="w-2 h-2 rounded-full bg-primary-600" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className={`flex items-center justify-between mt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(notification.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    {notification.link && (
                                                        <Link
                                                            href={notification.link}
                                                            onClick={() => {
                                                                setIsOpen(false);
                                                                if (!notification.isRead) markAsRead(notification._id);
                                                            }}
                                                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                                                        >
                                                            {t('viewDetails')}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 text-center border-t dark:border-gray-700">
                        <Link
                            href="/notifications"
                            className="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('viewAll')}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
