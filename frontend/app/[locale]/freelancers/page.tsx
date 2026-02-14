'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import {
    Search, Star, MapPin, Clock, DollarSign,
    Filter, ChevronDown, ChevronUp, Loader2, Users,
    Code, Smartphone, Palette, PenTool, Megaphone,
    Database, Video, Music, Briefcase, MoreHorizontal, X
} from 'lucide-react';
import api from '@/lib/api';

interface Freelancer {
    _id: string;
    userId: { _id: string; name: string; email: string };
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
    location: string;
}

// Maps moved inside component to use translations


export default function FreelancersPage() {
    const t = useTranslations('Freelancers');
    const tp = useTranslations('Projects');
    const locale = useLocale(); // Add this
    const isRtl = locale === 'ar'; // Add this

    const categoryMap: Record<string, { label: string; icon: any; color: string }> = {
        WEB_DEVELOPMENT: { label: tp('categories.WEB_DEVELOPMENT'), icon: Code, color: 'text-blue-500' },
        MOBILE_DEVELOPMENT: { label: tp('categories.MOBILE_DEVELOPMENT'), icon: Smartphone, color: 'text-green-500' },
        DESIGN: { label: tp('categories.DESIGN'), icon: Palette, color: 'text-pink-500' },
        WRITING: { label: tp('categories.WRITING'), icon: PenTool, color: 'text-yellow-500' },
        MARKETING: { label: tp('categories.MARKETING'), icon: Megaphone, color: 'text-red-500' },
        DATA_SCIENCE: { label: tp('categories.DATA_SCIENCE'), icon: Database, color: 'text-purple-500' },
        VIDEO_ANIMATION: { label: tp('categories.VIDEO_ANIMATION'), icon: Video, color: 'text-orange-500' },
        MUSIC_AUDIO: { label: tp('categories.MUSIC_AUDIO'), icon: Music, color: 'text-cyan-500' },
        BUSINESS: { label: tp('categories.BUSINESS'), icon: Briefcase, color: 'text-indigo-500' },
        OTHER: { label: tp('categories.OTHER'), icon: MoreHorizontal, color: 'text-gray-500' },
    };

    const availabilityMap: Record<string, { label: string; class: string }> = {
        AVAILABLE: { label: t('available'), class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
        BUSY: { label: t('busy'), class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        NOT_AVAILABLE: { label: t('notAvailable'), class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };

    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [availability, setAvailability] = useState('');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');
    const [sort, setSort] = useState('rating');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchFreelancers();
    }, [page, sort]);

    const fetchFreelancers = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 12, sort };
            if (search) params.search = search;
            if (category) params.category = category;
            if (availability) params.availability = availability;
            if (minRate) params.minRate = minRate;
            if (maxRate) params.maxRate = maxRate;

            const res = await api.get('/freelancers', { params });
            setFreelancers(res.data.freelancers);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchFreelancers();
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setAvailability('');
        setMinRate('');
        setMaxRate('');
        setSort('rating');
        setPage(1);
        setTimeout(fetchFreelancers, 0);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                    }`}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-3">
                        <Users className="w-10 h-10 text-primary-600" />
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {t('subtitle', { total })}
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8 px-2 md:px-0">
                    <div className="relative group">
                        <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors ${isRtl ? 'right-4' : 'left-4'}`} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            className={`input h-12 md:h-14 text-sm md:text-base ${isRtl ? 'pr-12 pl-32' : 'pl-12 pr-32'} shadow-soft focus:ring-primary-500/20`}
                        />
                        <button type="submit" className={`absolute ${isRtl ? 'left-1.5' : 'right-1.5'} top-1/2 -translate-y-1/2 btn-primary py-2 md:py-2.5 px-4 md:px-6 text-xs md:text-sm font-bold shadow-soft`}>
                            {tp('apply')}
                        </button>
                    </div>
                </form>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between max-w-3xl mx-auto mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary text-sm flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        {t('filterAdvanced')}
                        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="input w-auto text-sm"
                    >
                        <option value="rating">{t('topRated')}</option>
                        <option value="rate_low">{t('rateLow')}</option>
                        <option value="rate_high">{t('rateHigh')}</option>
                        <option value="projects">{t('mostProjects')}</option>
                        <option value="newest">{t('newest')}</option>
                    </select>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="max-w-3xl mx-auto mb-8 card p-6 animate-fade-in">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('category')}</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input text-sm">
                                    <option value="">{t('all')}</option>
                                    {Object.entries(categoryMap).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('availability')}</label>
                                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="input text-sm">
                                    <option value="">{t('all')}</option>
                                    <option value="AVAILABLE">{t('available')}</option>
                                    <option value="BUSY">{t('busy')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('priceRange')}</label>
                                <div className="flex gap-2">
                                    <input type="number" value={minRate} onChange={(e) => setMinRate(e.target.value)} placeholder={t('from')} className="input text-sm" />
                                    <input type="number" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} placeholder={t('to')} className="input text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={clearFilters} className="btn-secondary text-sm flex items-center gap-1">
                                <X className="w-4 h-4" /> {t('clearFilters')}
                            </button>
                            <button onClick={() => { setPage(1); fetchFreelancers(); }} className="btn-primary text-sm">{t('apply')}</button>
                        </div>
                    </div>
                )}

                {/* Categories Quick Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 px-2">
                    {Object.entries(categoryMap).slice(0, 8).map(([key, val]) => {
                        const Icon = val.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => { setCategory(category === key ? '' : key); setPage(1); setTimeout(fetchFreelancers, 0); }}
                                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${category === key
                                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span className="whitespace-nowrap">{val.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                    </div>
                ) : freelancers.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('noFreelancers')}</h3>
                        <p className="text-gray-500 dark:text-gray-500">{t('noFreelancersDesc')}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {freelancers.map((f) => {
                                const catInfo = categoryMap[f.category] || categoryMap.OTHER;
                                const CatIcon = catInfo.icon;
                                const avail = availabilityMap[f.availability] || availabilityMap.AVAILABLE;

                                return (
                                    <Link key={f._id} href={`/freelancers/${f._id}`}>
                                        <div className="card p-6 card-hover cursor-pointer group">
                                            {/* Top Row */}
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                                    {f.userId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition">
                                                        {f.userId?.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{f.title}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {renderStars(f.rating)}
                                                        <span className="text-xs text-gray-500 mr-1">({f.totalReviews})</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Badges */}
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <span className={`badge text-xs ${avail.class}`}>{avail.label}</span>
                                                <span className="badge text-xs bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 flex items-center gap-1">
                                                    <CatIcon className="w-3 h-3" />
                                                    {catInfo.label}
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {f.skills.slice(0, 4).map((skill, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {f.skills.length > 4 && (
                                                    <span className="px-2 py-0.5 text-xs text-gray-500">+{f.skills.length - 4}</span>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <DollarSign className="w-4 h-4 text-green-500" />
                                                    <span className="font-bold text-gray-900 dark:text-white">{t('currencySymbol')}{f.hourlyRate}</span>
                                                    <span className="text-gray-500 text-xs">{t('perHour')}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                    {f.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {f.location}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" /> {t('completedProjects', { n: f.completedProjects })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-10">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-medium transition ${page === i + 1
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
