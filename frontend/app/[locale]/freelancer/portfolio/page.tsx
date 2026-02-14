'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import {
    Plus, Edit, Trash2, ExternalLink, Eye, Loader2, Image as ImageIcon
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface PortfolioItem {
    _id: string;
    title: string;
    slug: string;
    coverImage: string;
    views: number;
    likes: string[];
    createdAt: string;
}

export default function FreelancerPortfolioPage() {
    const t = useTranslations('PortfolioManagement');
    const { user } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchPortfolio();
    }, [user]);

    const fetchPortfolio = async () => {
        try {
            const res = await api.get(`/portfolio/freelancer/${user?.id}`);
            setItems(res.data.data.items);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load portfolio');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!window.confirm(t('confirmDelete'))) return;

        try {
            await api.delete(`/portfolio/${slug}`);
            setItems(items.filter(item => item.slug !== slug));
            toast.success('Project deleted successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete project');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
                <Link href="/freelancer/portfolio/create" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {t('addNewProject')}
                </Link>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{t('noProjects')}</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item._id} className="card group">
                            <div className="relative h-48 bg-gray-100 overflow-hidden rounded-t-xl">
                                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {item.views}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1 truncate text-gray-900 dark:text-white">{item.title}</h3>
                                <p className="text-xs text-gray-500 mb-4">{new Date(item.createdAt).toLocaleDateString()}</p>

                                <div className="flex justify-between gap-2">
                                    <Link href={`/portfolio/${item.slug}`} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> View
                                    </Link>
                                    <Link href={`/freelancer/portfolio/${item.slug}/edit`} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1">
                                        <Edit className="w-3 h-3" /> Edit
                                    </Link>
                                    <button onClick={() => handleDelete(item.slug)} className="btn-danger text-xs px-3">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
