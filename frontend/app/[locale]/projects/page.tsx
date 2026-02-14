'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import {
    Search, DollarSign, Clock, Filter, ChevronDown, ChevronUp,
    Loader2, FolderOpen, Plus, Users, X, Code, Smartphone, Palette,
    PenTool, Megaphone, Database, Video, Music, Briefcase, MoreHorizontal
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Project {
    _id: string;
    title: string;
    description: string;
    clientId: { _id: string; name: string };
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

// Maps moved inside component to use translations

export default function ProjectsPage() {
    const t = useTranslations('Projects');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const categoryMap: Record<string, { label: string; icon: any }> = {
        WEB_DEVELOPMENT: { label: t('categories.WEB_DEVELOPMENT'), icon: Code },
        MOBILE_DEVELOPMENT: { label: t('categories.MOBILE_DEVELOPMENT'), icon: Smartphone },
        DESIGN: { label: t('categories.DESIGN'), icon: Palette },
        WRITING: { label: t('categories.WRITING'), icon: PenTool },
        MARKETING: { label: t('categories.MARKETING'), icon: Megaphone },
        DATA_SCIENCE: { label: t('categories.DATA_SCIENCE'), icon: Database },
        VIDEO_ANIMATION: { label: t('categories.VIDEO_ANIMATION'), icon: Video },
        MUSIC_AUDIO: { label: t('categories.MUSIC_AUDIO'), icon: Music },
        BUSINESS: { label: t('categories.BUSINESS'), icon: Briefcase },
        OTHER: { label: t('categories.OTHER'), icon: MoreHorizontal },
    };

    const durationMap: Record<string, string> = {
        LESS_THAN_1_WEEK: t('durations.LESS_THAN_1_WEEK'),
        LESS_THAN_1_MONTH: t('durations.LESS_THAN_1_MONTH'),
        '1_TO_3_MONTHS': t('durations.1_TO_3_MONTHS'),
        '3_TO_6_MONTHS': t('durations.3_TO_6_MONTHS'),
        MORE_THAN_6_MONTHS: t('durations.MORE_THAN_6_MONTHS'),
    };

    const experienceMap: Record<string, string> = {
        ENTRY: t('experience.ENTRY'),
        MID: t('experience.MID'),
        SENIOR: t('experience.SENIOR'),
        EXPERT: t('experience.EXPERT'),
    };
    const [category, setCategory] = useState('');
    const [budgetType, setBudgetType] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [sort, setSort] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => { fetchProjects(); }, [page, sort]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 12, sort };
            if (search) params.search = search;
            if (category) params.category = category;
            if (budgetType) params.budgetType = budgetType;
            if (experienceLevel) params.experienceLevel = experienceLevel;

            const res = await api.get('/projects', { params });
            setProjects(res.data.projects);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.total);
        } catch (error) {
            console.error(error);
        } finally { setLoading(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchProjects();
    };

    const clearFilters = () => {
        setSearch(''); setCategory(''); setBudgetType(''); setExperienceLevel('');
        setSort('newest'); setPage(1);
        setTimeout(fetchProjects, 0);
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return t('minsAgo', { n: mins });
        const hours = Math.floor(mins / 60);
        if (hours < 24) return t('hoursAgo', { n: hours });
        const days = Math.floor(hours / 24);
        return t('daysAgo', { n: days });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 transition-colors">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div className="text-center md:text-right mb-4 md:mb-0">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                            <FolderOpen className="w-10 h-10 text-primary-600" />
                            {t('title')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">{total} {t('openProjects')}</p>
                    </div>
                    {user && (
                        <Link href="/projects/new" className="btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" /> {t('postProject')}
                        </Link>
                    )}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6">
                    <div className="relative">
                        <Search className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('searchPlaceholder')} className={`input ${isRtl ? 'pl-12 pr-32' : 'pr-12 pl-32'}`} />
                        <button type="submit" className={`absolute ${isRtl ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 btn-primary py-2 px-6 text-sm`}>{t('apply')}</button>
                    </div>
                </form>

                {/* Filter & Sort bar */}
                <div className="flex items-center justify-between max-w-3xl mx-auto mb-6">
                    <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary text-sm flex items-center gap-2">
                        <Filter className="w-4 h-4" /> {t('filter')}
                        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="input w-auto text-sm">
                        <option value="newest">{tc('newest')}</option>
                        <option value="budget_high">{tc('highestSalary')}</option>
                        <option value="budget_low">{tc('lowestSalary')}</option>
                        <option value="proposals">{tc('mostProposals')}</option>
                    </select>
                </div>

                {/* Filters panel */}
                {showFilters && (
                    <div className="max-w-3xl mx-auto mb-8 card p-6 animate-fade-in">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('category')}</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input text-sm">
                                    <option value="">{t('all')}</option>
                                    {Object.entries(categoryMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('budgetType')}</label>
                                <select value={budgetType} onChange={(e) => setBudgetType(e.target.value)} className="input text-sm">
                                    <option value="">{t('all')}</option>
                                    <option value="FIXED">{t('fixedPrice')}</option>
                                    <option value="HOURLY">{t('hourly')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('experienceLevel')}</label>
                                <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="input text-sm">
                                    <option value="">{t('all')}</option>
                                    {Object.entries(experienceMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={clearFilters} className="btn-secondary text-sm flex items-center gap-1"><X className="w-4 h-4" /> {t('clear')}</button>
                            <button onClick={() => { setPage(1); fetchProjects(); }} className="btn-primary text-sm">{t('apply')}</button>
                        </div>
                    </div>
                )}

                {/* Category Chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {Object.entries(categoryMap).slice(0, 6).map(([key, val]) => {
                        const Icon = val.icon;
                        return (
                            <button key={key} onClick={() => { setCategory(category === key ? '' : key); setPage(1); setTimeout(fetchProjects, 0); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${category === key
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500'
                                    }`}>
                                <Icon className="w-4 h-4" />{val.label}
                            </button>
                        );
                    })}
                </div>

                {/* Project List */}
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('noProjects')}</h3>
                        <p className="text-gray-500">{t('noProjectsDesc')}</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {projects.map((p) => {
                            const catInfo = categoryMap[p.category] || categoryMap.OTHER;
                            const CatIcon = catInfo.icon;
                            return (
                                <Link key={p._id} href={`/projects/${p._id}`}>
                                    <div className="card p-6 card-hover cursor-pointer group mb-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition mb-1">
                                                    {p.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1"><CatIcon className="w-4 h-4" />{catInfo.label}</span>
                                                    <span>{p.budgetType === 'FIXED' ? t('fixedPrice') : t('hourly')}</span>
                                                    <span>{timeAgo(p.createdAt)}</span>
                                                    <span>{experienceMap[p.experienceLevel]}</span>
                                                </div>
                                            </div>
                                            <div className={`text-left flex-shrink-0 ${isRtl ? 'ml-4' : 'mr-4'} rtl:text-right`}>
                                                <div className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                                    <DollarSign className="w-5 h-5" />
                                                    {p.budgetMin && p.budgetMax ? `${p.budgetMin} - ${p.budgetMax}` : p.budgetMax || p.budgetMin || '—'}
                                                </div>
                                                <div className="text-xs text-gray-500">{p.budgetType === 'HOURLY' ? t('perHour') : t('fixedPrice')}</div>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{p.description}</p>

                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {p.skills.slice(0, 5).map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">{s}</span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Users className="w-4 h-4" />
                                                <span>{t('proposals', { n: p.proposalCount })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span>{durationMap[p.duration] || p.duration}</span>
                                            </div>
                                            {p.companyId?.name && (
                                                <span className="text-sm text-gray-500">{p.companyId.name}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-10">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-medium transition ${page === i + 1
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500'
                                    }`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
