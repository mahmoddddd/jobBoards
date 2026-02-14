'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import {
    Star, MapPin, DollarSign, Clock, Briefcase, Globe, Award,
    CheckCircle, ArrowRight, Loader2, ExternalLink, Code, Smartphone,
    Palette, PenTool, Megaphone, Database, Video, Music, MoreHorizontal, MessageCircle, ArrowLeft
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface PortfolioItem {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    link: string;
}

interface FreelancerProfile {
    _id: string;
    userId: { _id: string; name: string; email: string; createdAt: string };
    title: string;
    bio: string;
    skills: string[];
    category: string;
    hourlyRate: number;
    availability: string;
    experienceLevel: string;
    rating: number;
    totalReviews: number;
    completedProjects: number;
    totalEarnings: number;
    successRate: number;
    location: string;
    portfolio: PortfolioItem[];
    languages: { language: string; level: string }[];
    createdAt: string;
}

interface Review {
    _id: string;
    userId: { _id: string; name: string; avatar?: string };
    rating: number;
    comment: string;
    createdAt: string;
    contractId?: { title: string };
}

// Maps moved inside component to use translations


export default function FreelancerDetailPage() {
    const t = useTranslations('FreelancerDetail');
    const tf = useTranslations('Freelancers');
    const tp = useTranslations('Projects');
    const tc = useTranslations('Common');
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

    const experienceMap: Record<string, string> = {
        ENTRY: tp('experience.ENTRY'),
        MID: tp('experience.MID'),
        SENIOR: tp('experience.SENIOR'),
        EXPERT: tp('experience.EXPERT'),
    };

    const availabilityMap: Record<string, { label: string; class: string }> = {
        AVAILABLE: { label: tf('available'), class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
        BUSY: { label: tf('busy'), class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        NOT_AVAILABLE: { label: tf('notAvailable'), class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };

    const langLevelMap: Record<string, string> = {
        BASIC: t('langLevels.BASIC'),
        CONVERSATIONAL: t('langLevels.CONVERSATIONAL'),
        FLUENT: t('langLevels.FLUENT'),
        NATIVE: t('langLevels.NATIVE'),
    };

    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [profile, setProfile] = useState<FreelancerProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');
    const [contacting, setContacting] = useState(false);

    useEffect(() => {
        if (params.id) fetchProfile();
    }, [params.id]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/freelancers/${params.id}`);
            setProfile(res.data.profile);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/freelancer/${profile?.userId._id}`);
            setReviews(res.data.reviews);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (activeTab === 'reviews' && profile) {
            fetchReviews();
        }
    }, [activeTab, profile]);

    const handleContact = async () => {
        if (!user) return router.push('/login');
        if (user.id === profile?.userId._id) return; // Can't message self

        setContacting(true);
        try {
            const res = await api.post('/messages/conversations', {
                recipientId: profile?.userId._id
            });
            // The response might be { conversation: ... }
            // We can just redirect to /messages which will load the list and maybe we can auto-select?
            // For now, since my messages page auto-selects nothing, users have to click.
            // A better UX would be to support ?conversationId=... in messages page.
            // I'll just redirect to /messages for now.
            router.push('/messages');
        } catch (error) {
            console.error(error);
        } finally {
            setContacting(false);
        }
    };

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">{rating.toFixed(1)}</span>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 px-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('notFound')}</h2>
                <Link href="/freelancers" className="btn-primary">{tf('title')}</Link>
            </div>
        );
    }

    const catInfo = categoryMap[profile.category] || categoryMap.OTHER;
    const CatIcon = catInfo.icon;
    const avail = availabilityMap[profile.availability] || availabilityMap.AVAILABLE;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back */}
                <Link href="/freelancers" className="inline-flex items-center gap-1 text-primary-600 hover:underline mb-6">
                    {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {t('backToFreelancers')}
                </Link>

                {/* Profile Header */}
                <div className="card p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 shadow-lg">
                            {profile.userId?.name?.charAt(0) || 'U'}
                        </div>
                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.userId?.name}</h1>
                                <span className={`badge text-sm ${avail.class}`}>{avail.label}</span>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{profile.title}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {renderStars(profile.rating)}
                                <span>{t('reviewsCount', { n: profile.totalReviews })}</span>
                                {profile.location && (
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                                )}
                                <span className="flex items-center gap-1">
                                    <CatIcon className="w-4 h-4" /> {catInfo.label}
                                </span>
                            </div>
                            {/* Skills */}
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm rounded-lg">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Sidebar Stats */}
                        <div className="flex flex-col items-end gap-3 flex-shrink-0">
                            <div className="text-right">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                    <DollarSign className="w-7 h-7 text-green-500" />{tf('currencySymbol')}{profile.hourlyRate}
                                </div>
                                <div className="text-sm text-gray-500">{t('hourlyRate')}</div>
                            </div>
                            <button onClick={handleContact} disabled={contacting || (user?.id === profile.userId._id)}
                                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                                {contacting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                                {t('contactNow')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: t('completedProjects'), value: profile.completedProjects, icon: Briefcase },
                        { label: t('successRate'), value: `${profile.successRate}%`, icon: CheckCircle },
                        { label: t('experienceLevel'), value: experienceMap[profile.experienceLevel], icon: Award },
                        { label: t('memberSince'), value: new Date(profile.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short' }), icon: Clock },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="card p-4 text-center">
                                <Icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 w-fit">
                    {[
                        { key: 'about', label: t('tabs.about') },
                        { key: 'portfolio', label: t('tabs.portfolio', { n: profile.portfolio.length }) },
                        { key: 'reviews', label: t('tabs.reviews', { n: profile.totalReviews }) },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.key
                                ? 'bg-primary-600 text-white shadow'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'about' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 card p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('aboutFreelancer')}</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                        </div>
                        <div className="space-y-4">
                            {profile.languages.length > 0 && (
                                <div className="card p-5">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-primary-600" /> {t('languages')}
                                    </h4>
                                    <div className="space-y-2">
                                        {profile.languages.map((lang: { language: string; level: string }, i: number) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">{lang.language}</span>
                                                <span className="text-gray-500">{langLevelMap[lang.level] || lang.level}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'portfolio' && (
                    <div>
                        {profile.portfolio.length === 0 ? (
                            <div className="card p-12 text-center">
                                <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">{t('noPortfolio')}</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {profile.portfolio.map((item: PortfolioItem) => (
                                    <div key={item._id} className="card overflow-hidden group">
                                        {item.imageUrl && (
                                            <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                                            {item.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                                            )}
                                            {item.link && (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer"
                                                    className="text-primary-600 hover:underline text-sm flex items-center gap-1">
                                                    <ExternalLink className="w-4 h-4" /> {t('viewProject')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="card p-12 text-center">
                                <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">{t('noReviews')}</p>
                            </div>
                        ) : (
                            reviews.map((review: Review) => (
                                <div key={review._id} className="card p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                                {review.userId.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{review.userId.name}</div>
                                                <div className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</div>
                                            </div>
                                        </div>
                                        {renderStars(review.rating)}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
                                    {review.contractId && (
                                        <div className="mt-3 text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg inline-block">
                                            {t('projectLabel', { title: review.contractId.title })}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
