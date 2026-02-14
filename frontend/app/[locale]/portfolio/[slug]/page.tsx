'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import {
    Heart, Eye, Calendar, ExternalLink, Share2, ArrowRight, ArrowLeft, Loader2,
    Code, Image as ImageIcon
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface PortfolioItem {
    _id: string;
    title: string;
    description: string;
    slug: string;
    coverImage: string;
    images: string[];
    videoUrl?: string;
    link?: string;
    completionDate?: string;
    skills: string[];
    views: number;
    likes: string[];
    freelancerId: {
        _id: string;
        name: string;
        avatar?: string;
    };
    createdAt: string;
}

export default function PortfolioItemPage() {
    const t = useTranslations('Portfolio');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const params = useParams();
    const { user } = useAuth();

    const [item, setItem] = useState<PortfolioItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);

    useEffect(() => {
        if (params.slug) fetchItem();
    }, [params.slug]);

    const fetchItem = async () => {
        try {
            const res = await api.get(`/portfolio/${params.slug}`);
            setItem(res.data.data.item);
            setLikesCount(res.data.data.item.likes.length);
            if (user) {
                setIsLiked(res.data.data.item.likes.includes(user.id));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) return toast.error('Please login to like');
        if (likeLoading) return;

        setLikeLoading(true);
        try {
            const res = await api.post(`/portfolio/${params.slug}/like`);
            setLikesCount(res.data.data.likes);
            setIsLiked(res.data.data.isLiked);
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLikeLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 px-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('notFound')}</h2>
                <Link href="/" className="btn-primary">{t('backToProfile')}</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {item.views} {t('views')}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLike}
                            disabled={likeLoading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isLiked
                                    ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{likesCount}</span>
                        </button>
                        {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" /> {t('liveLink')}
                            </a>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column (Images & Description) */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Cover Image */}
                        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <img src={item.coverImage} alt={item.title} className="w-full h-auto object-cover" />
                        </div>

                        {/* Description */}
                        <div className="card p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('description')}</h3>
                            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {item.description}
                            </div>
                        </div>

                        {/* Gallery */}
                        {item.images && item.images.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('gallery')}</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {item.images.map((img, idx) => (
                                        <div key={idx} className="rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                                            <img src={img} alt={`${item.title} ${idx + 1}`} className="w-full h-auto" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-6">
                        {/* Freelancer Card */}
                        <div className="card p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('moreFromFreelancer')}</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                                    {item.freelancerId.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{item.freelancerId.name}</div>
                                    <Link href={`/freelancers/${item.freelancerId._id}`} className="text-sm text-primary-600 hover:underline">
                                        {t('backToProfile')}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        {item.skills && item.skills.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('skills')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {item.skills.map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="card p-6 space-y-4">
                            {item.completionDate && (
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">{t('completedDate')}</div>
                                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary-600" />
                                        {new Date(item.completionDate).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                            <button className="btn-secondary w-full flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" /> {t('share')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
