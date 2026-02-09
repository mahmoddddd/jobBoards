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
    Loader2
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { JobCardSkeleton } from '@/components/skeletons/CardSkeletons';

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
    }, [page, jobType, experienceLevel]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
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
            FULL_TIME: { label: 'دوام كامل', class: 'bg-green-100 text-green-800' },
            PART_TIME: { label: 'دوام جزئي', class: 'bg-blue-100 text-blue-800' },
            CONTRACT: { label: 'عقد', class: 'bg-purple-100 text-purple-800' },
            REMOTE: { label: 'عن بعد', class: 'bg-orange-100 text-orange-800' },
            INTERNSHIP: { label: 'تدريب', class: 'bg-pink-100 text-pink-800' },
        };
        return types[type] || { label: type, class: 'bg-gray-100 text-gray-800' };
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section - extends to top for header visibility */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-32 pb-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-4">استكشف الوظائف المتاحة</h1>
                    <p className="text-primary-100 mb-8">اعثر على فرصتك المثالية من بين آلاف الوظائف</p>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث بالعنوان أو الكلمات المفتاحية..."
                                className="w-full pr-12 pl-4 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="الموقع..."
                                className="w-full pr-12 pl-4 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button type="submit" className="btn bg-white text-primary-700 hover:bg-gray-100 px-8">
                            بحث
                        </button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden w-full btn-secondary mb-4"
                        >
                            <Filter className="w-4 h-4 ml-2" />
                            الفلاتر
                        </button>

                        <div className={`card p-6 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            <div>
                                <h3 className="font-semibold mb-3">نوع الوظيفة</h3>
                                <div className="space-y-2">
                                    {jobTypes.map((type) => (
                                        <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="jobType"
                                                value={type.value}
                                                checked={jobType === type.value}
                                                onChange={(e) => { setJobType(e.target.value); setPage(1); }}
                                                className="text-primary-600"
                                            />
                                            <span>{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">مستوى الخبرة</h3>
                                <div className="space-y-2">
                                    {experienceLevels.map((level) => (
                                        <label key={level.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="experienceLevel"
                                                value={level.value}
                                                checked={experienceLevel === level.value}
                                                onChange={(e) => { setExperienceLevel(e.target.value); setPage(1); }}
                                                className="text-primary-600"
                                            />
                                            <span>{level.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid gap-4">
                                {[...Array(5)].map((_, i) => (
                                    <JobCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-20">
                                <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد وظائف</h3>
                                <p className="text-gray-500">جرب تغيير معايير البحث</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4">
                                    {jobs.map((job) => {
                                        const typeBadge = getJobTypeBadge(job.jobType);
                                        return (
                                            <Link key={job._id} href={`/jobs/${job._id}`}>
                                                <div className="card p-6 hover:shadow-xl transition-all group">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                        {/* Company Logo */}
                                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                                                            {job.companyId.logo ? (
                                                                <img src={job.companyId.logo} alt={job.companyId.name} className="w-full h-full object-cover rounded-xl" />
                                                            ) : (
                                                                <Building2 className="w-8 h-8 text-gray-400" />
                                                            )}
                                                        </div>

                                                        {/* Job Info */}
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                                {job.title}
                                                            </h3>
                                                            <p className="text-gray-600 mb-2">{job.companyId.name}</p>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-4 h-4" />
                                                                    {job.location}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    {formatDate(job.createdAt)}
                                                                </span>
                                                                <span className={`badge ${typeBadge.class}`}>
                                                                    {typeBadge.label}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Stats */}
                                                        <div className="text-left">
                                                            <div className="text-sm text-gray-500">
                                                                {job.applicationCount} متقدم
                                                            </div>
                                                            {job.salaryMin && (
                                                                <div className="text-primary-600 font-semibold">
                                                                    {job.salaryMin.toLocaleString()} - {job.salaryMax?.toLocaleString()} ج.م
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
