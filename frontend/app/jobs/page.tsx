'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

const jobTypes = [
    { value: '', label: 'الكل' },
    { value: 'FULL_TIME', label: 'دوام كامل' },
    { value: 'PART_TIME', label: 'دوام جزئي' },
    { value: 'CONTRACT', label: 'عقد' },
    { value: 'REMOTE', label: 'عن بعد' },
    { value: 'INTERNSHIP', label: 'تدريب' },
];

const experienceLevels = [
    { value: '', label: 'الكل' },
    { value: 'ENTRY', label: 'مبتدئ' },
    { value: 'MID', label: 'متوسط' },
    { value: 'SENIOR', label: 'خبير' },
    { value: 'LEAD', label: 'قائد' },
];

export default function JobsPage() {
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
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'اليوم';
        if (days === 1) return 'أمس';
        if (days < 7) return `منذ ${days} أيام`;
        if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
        return `منذ ${Math.floor(days / 30)} شهور`;
    };

    const getJobTypeBadge = (type: string) => {
        const types: Record<string, { label: string; class: string }> = {
            FULL_TIME: { label: 'دوام كامل', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
            PART_TIME: { label: 'دوام جزئي', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
            CONTRACT: { label: 'عقد', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
            REMOTE: { label: 'عن بعد', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
            INTERNSHIP: { label: 'تدريب', class: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' },
        };
        return types[type] || { label: type, class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-32 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl font-bold mb-4 text-center md:text-right">استكشف الوظائف المتاحة</h1>
                    <p className="text-primary-100 mb-8 text-lg text-center md:text-right">اعثر على فرصتك المثالية من بين آلاف الوظائف المتاحة يومياً</p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto md:mx-0 transition-all">
                        <div className="flex-1 relative group">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث بالعنوان، المهارات، أو اسم الشركة..."
                                className="w-full h-14 pr-12 pl-4 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50 transition-colors"
                            />
                        </div>
                        <div className="w-px bg-gray-200 dark:bg-gray-700 hidden md:block my-2"></div>
                        <div className="flex-1 relative group">
                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="الموقع (المدينة أو الدولة)..."
                                className="w-full h-14 pr-12 pl-4 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50 transition-colors"
                            />
                        </div>
                        <button type="submit" className="btn-primary h-14 px-8 text-lg shadow-lg hover:shadow-primary-500/25">
                            بحث
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
                            {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
                        </button>

                        <div className={`space-y-6 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>

                            {/* Clear Filters */}
                            {(search || location || jobType || experienceLevel || minSalary) && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    تفريغ كل الفلاتر
                                </button>
                            )}

                            <div className="card p-5">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                                    <Briefcase className="w-4 h-4 text-primary-600" />
                                    نوع الوظيفة
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
                                    مستوى الخبرة
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
                                    الحد الأدنى للراتب
                                </h3>
                                <div className="space-y-4">
                                    <input
                                        type="number"
                                        value={minSalary}
                                        onChange={(e) => setMinSalary(e.target.value)}
                                        placeholder="مثال: 5000"
                                        className="input w-full text-sm"
                                    />
                                    <button
                                        onClick={() => { setPage(1); fetchJobs(); }}
                                        className="btn-primary-sm w-full"
                                    >
                                        تطبيق
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {loading ? 'جاري البحث...' : `وجدنا ${jobs.length} وظيفة متاحة`}
                            </h2>
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>ترتيب حسب:</span>
                                <select className="bg-transparent border-none focus:ring-0 font-medium text-gray-900 dark:text-white cursor-pointer">
                                    <option>الأحدث</option>
                                    <option>الأعلى راتباً</option>
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
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">لا توجد وظائف تطابق بحثك</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">جرب تغيير معايير البحث أو حذف بعض الفلاتر</p>
                                <button onClick={clearFilters} className="btn-primary">
                                    مسح كل الفلاتر
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
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                                                {job.title}
                                                            </h3>
                                                            {formatDate(job.createdAt) === 'اليوم' && (
                                                                <span className="badge-red text-xs px-2 py-0.5 animate-pulse">جديد</span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-3 flex items-center gap-1">
                                                            <Building2 className="w-4 h-4" />
                                                            {job.companyId.name}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg">
                                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                                {job.location}
                                                            </span>
                                                            <span className={`badge ${typeBadge.class} flex items-center gap-1.5 px-2.5 py-1 rounded-lg`}>
                                                                <Briefcase className="w-3.5 h-3.5" />
                                                                {typeBadge.label}
                                                            </span>

                                                            {job.salaryMin && (
                                                                <span className="hidden md:flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium px-2.5 py-1">
                                                                    <Banknote className="w-4 h-4" />
                                                                    {job.salaryMin.toLocaleString()}+ ج.م
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action / Time */}
                                                    <div className="flex flex-row md:flex-col justify-between items-end gap-2 md:pl-2 border-t md:border-t-0 md:border-r border-gray-100 dark:border-gray-700 pt-4 md:pt-0 pr-0 md:pr-4 mt-2 md:mt-0">
                                                        <div className="text-left w-full">
                                                            <span className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDate(job.createdAt)}
                                                            </span>
                                                        </div>
                                                        <button className="btn-primary-outline w-full md:w-auto text-sm py-2 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                            عرض التفاصيل
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
