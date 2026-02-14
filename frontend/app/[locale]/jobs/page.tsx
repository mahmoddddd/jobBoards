'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { jobsAPI } from '@/lib/api';
import {
    Search,
    MapPin,
    Briefcase,
    Clock,
    Building2,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Banknote,
    X
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

interface Job {
    _id: string;
    title: string;
    description: string;
    location: string;
    jobType: string;
    experienceLevel: string;
    salaryMin?: number;
    salaryMax?: number;
    companyId: {
        _id: string;
        name: string;
        logo?: string;
    };
    createdAt: string;
    applicationCount: number;
}



export default function JobsPage() {
    const t = useTranslations('Jobs');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const searchParams = useSearchParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const jobTypes = [
        { value: '', label: t('allTypes') },
        { value: 'FULL_TIME', label: t('fullTime') },
        { value: 'PART_TIME', label: t('partTime') },
        { value: 'CONTRACT', label: t('contract') },
        { value: 'REMOTE', label: t('remote') },
        { value: 'INTERNSHIP', label: t('internship') },
    ];

    const experienceLevels = [
        { value: '', label: t('allTypes') },
        { value: 'ENTRY', label: t('experience.ENTRY') },
        { value: 'MID', label: t('experience.MID') },
        { value: 'SENIOR', label: t('experience.SENIOR') },
        { value: 'LEAD', label: t('experience.LEAD') },
    ];

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 12 };
            if (search) params.search = search;
            if (location) params.location = location;
            if (jobType) params.jobType = jobType;
            if (experienceLevel) params.experienceLevel = experienceLevel;
            if (minSalary) params.salaryMin = minSalary;

            const response = await jobsAPI.getAll(params);
            setJobs(response.data.jobs);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [page, jobType, experienceLevel, minSalary]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchJobs();
    };

    const clearFilters = () => {
        setSearch('');
        setLocation('');
        setJobType('');
        setExperienceLevel('');
        setMinSalary('');
        setPage(1);
        fetchJobs();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    const getJobTypeBadge = (type: string) => {
        const types: Record<string, { label: string; class: string }> = {
            FULL_TIME: { label: t('fullTime'), class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
            PART_TIME: { label: t('partTime'), class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
            CONTRACT: { label: t('contract'), class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
            REMOTE: { label: t('remote'), class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
            INTERNSHIP: { label: t('internship'), class: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' },
        };
        return types[type] || { label: type, class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-32 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className={`text-4xl font-bold mb-4 text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>{t('title')}</h1>
                    <p className={`text-primary-100 mb-8 text-lg text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>{t('subtitle')}</p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto md:mx-0 transition-all">
                        <div className="flex-1 relative group">
                            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors`} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('searchPlaceholder')}
                                className={`w-full h-12 md:h-14 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl bg-transparent text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50 transition-colors`}
                            />
                        </div>
                        <div className="w-px bg-gray-200 dark:bg-gray-700 hidden md:block my-2"></div>
                        <div className="flex-1 relative group">
                            <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors`} />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder={t('locationPlaceholder')}
                                className={`w-full h-12 md:h-14 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl bg-transparent text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50 transition-colors`}
                            />
                        </div>
                        <button type="submit" className="btn-primary h-12 md:h-14 px-8 text-base md:text-lg shadow-lg hover:shadow-primary-500/25">
                            {t('search')}
                        </button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-72 flex-shrink-0">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden w-full btn-secondary mb-4 flex items-center justify-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            {showFilters ? tc('showLess') : t('filters')}
                        </button>

                        <div className={`space-y-6 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>

                            {/* Clear Filters */}
                            {(search || location || jobType || experienceLevel || minSalary) && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    {tc('noResults')}
                                </button>
                            )}

                            <div className="card p-5">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                                    <Briefcase className="w-4 h-4 text-primary-600" />
                                    {t('jobType')}
                                </h3>
                                <div className="space-y-3">
                                    {jobTypes.map((type) => (
                                        <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="radio"
                                                    name="jobType"
                                                    value={type.value}
                                                    checked={jobType === type.value}
                                                    onChange={(e) => { setJobType(e.target.value); setPage(1); }}
                                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-primary-600 transition-all"
                                                />
                                                <span className="absolute bg-primary-600 w-2 h-2 rounded-full opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity pointer-events-none"></span>
                                            </div>
                                            <span className={`text-sm group-hover:text-primary-600 transition-colors ${jobType === type.value ? 'font-medium text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {type.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="card p-5">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                                    <Clock className="w-4 h-4 text-primary-600" />
                                    {t('experienceLevel')}
                                </h3>
                                <div className="space-y-3">
                                    {experienceLevels.map((level) => (
                                        <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="radio"
                                                    name="experienceLevel"
                                                    value={level.value}
                                                    checked={experienceLevel === level.value}
                                                    onChange={(e) => { setExperienceLevel(e.target.value); setPage(1); }}
                                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-primary-600 transition-all"
                                                />
                                                <span className="absolute bg-primary-600 w-2 h-2 rounded-full opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity pointer-events-none"></span>
                                            </div>
                                            <span className={`text-sm group-hover:text-primary-600 transition-colors ${experienceLevel === level.value ? 'font-medium text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {level.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="card p-5">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                                    <Banknote className="w-4 h-4 text-primary-600" />
                                    {t('salary')}
                                </h3>
                                <div className="space-y-4">
                                    <input
                                        type="number"
                                        value={minSalary}
                                        onChange={(e) => setMinSalary(e.target.value)}
                                        placeholder={t('salary')}
                                        className="input w-full text-sm"
                                    />
                                    <button
                                        onClick={() => { setPage(1); fetchJobs(); }}
                                        className="btn-primary-sm w-full"
                                    >
                                        {tc('submit')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {loading ? tc('loading') : t('jobsFound') + `: ${jobs.length}`}
                            </h2>
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>{t('sortBy')}</span>
                                <select className="bg-transparent border-none focus:ring-0 font-medium text-gray-900 dark:text-white cursor-pointer">
                                    <option>{t('newest')}</option>
                                    <option>{t('highestSalary')}</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="card p-6 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <Briefcase className="w-20 h-20 mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('noResults')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('noResultsDesc')}</p>
                                <button onClick={clearFilters} className="btn-primary">
                                    {tc('cancel')}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {jobs.map((job) => {
                                        const typeBadge = getJobTypeBadge(job.jobType);
                                        return (
                                            <Link key={job._id} href={`/jobs/${job._id}`} className="block group">
                                                <div className="card p-6 flex flex-col md:flex-row md:items-center gap-6 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                                    {/* Company Logo */}
                                                    <div className="relative">
                                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 p-2 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                            {job.companyId.logo ? (
                                                                <img src={job.companyId.logo} alt={job.companyId.name} className="w-full h-full object-contain rounded-xl" />
                                                            ) : (
                                                                <Building2 className="w-8 h-8 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Job Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                                                {job.title}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium mb-3 flex items-center gap-1">
                                                            <Building2 className="w-4 h-4" />
                                                            {job.companyId.name}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 md:px-2.5 py-1 rounded-lg">
                                                                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                                                                {job.location}
                                                            </span>
                                                            <span className={`badge ${typeBadge.class} flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-lg`}>
                                                                <Briefcase className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                                {typeBadge.label}
                                                            </span>

                                                            {job.salaryMin && (
                                                                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold px-1.5 md:px-2.5 py-1">
                                                                    <Banknote className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                                                    {job.salaryMin.toLocaleString()}{t('currencySymbol')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action / Time */}
                                                    <div className={`flex flex-row md:flex-col justify-between items-center md:items-end gap-2 ${isRtl ? 'md:pr-4 md:border-r' : 'md:pl-4 md:border-l'} border-gray-100 dark:border-gray-700 pt-4 md:pt-0 mt-2 md:mt-0`}>
                                                        <div className={`flex-shrink-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                                                            <span className={`text-[10px] md:text-xs text-gray-400 flex items-center gap-1 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                                                                <Clock className="w-3 h-3" />
                                                                {formatDate(job.createdAt)}
                                                            </span>
                                                        </div>
                                                        <button className="btn-primary md:btn-primary-outline w-auto px-4 md:px-6 py-2 text-xs md:text-sm font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors shadow-soft">
                                                            {t('viewDetails')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8">
                                        <Pagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            onPageChange={setPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
