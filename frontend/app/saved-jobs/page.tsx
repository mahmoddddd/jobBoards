'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Bookmark,
    MapPin,
    Building2,
    Clock,
    Trash2,
    Loader2,
    ArrowRight,
    Briefcase,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface SavedJob {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        location: string;
        jobType: string;
        salaryMin: number;
        salaryMax: number;
        companyId: {
            name: string;
            logo?: string;
        };
        createdAt: string;
        status: string;
    };
    savedAt: string;
}

export default function SavedJobsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (user) {
            fetchSavedJobs();
        }
    }, [user, authLoading, router]);

    const fetchSavedJobs = async () => {
        try {
            const res = await api.get('/users/saved-jobs');
            setSavedJobs(res.data.savedJobs || []);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
            // If endpoint doesn't exist yet, show empty state
            setSavedJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await api.delete(`/users/saved-jobs/${id}`);
            setSavedJobs(prev => prev.filter(job => job._id !== id));
            toast.success('تم إزالة الوظيفة من المحفوظات');
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const getJobTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            'FULL_TIME': 'دوام كامل',
            'PART_TIME': 'دوام جزئي',
            'CONTRACT': 'عقد',
            'REMOTE': 'عن بعد',
            'INTERNSHIP': 'تدريب',
        };
        return types[type] || type;
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-32 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/jobs" className="text-primary-100 hover:text-white inline-flex items-center gap-1 mb-6 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                        العودة للوظائف
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <Bookmark className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">الوظائف المحفوظة</h1>
                            <p className="text-primary-100">{savedJobs.length} وظيفة محفوظة</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-12">

                {/* Jobs List */}
                {savedJobs.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
                            <Bookmark className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">لا توجد وظائف محفوظة</h3>
                        <p className="text-gray-600 mb-6">
                            ابدأ بحفظ الوظائف التي تهمك للرجوع إليها لاحقاً
                        </p>
                        <Link href="/jobs" className="btn-primary inline-flex">
                            <Briefcase className="w-5 h-5 ml-2" />
                            تصفح الوظائف
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedJobs.map((saved) => (
                            <div key={saved._id} className="card p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            {saved.jobId.companyId?.logo ? (
                                                <img
                                                    src={saved.jobId.companyId.logo}
                                                    alt={saved.jobId.companyId.name}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <Link
                                                href={`/jobs/${saved.jobId._id}`}
                                                className="text-lg font-semibold hover:text-primary-600 transition"
                                            >
                                                {saved.jobId.title}
                                            </Link>
                                            <p className="text-gray-600">{saved.jobId.companyId?.name}</p>
                                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {saved.jobId.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" />
                                                    {getJobTypeLabel(saved.jobId.jobType)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    محفوظة {new Date(saved.savedAt).toLocaleDateString('ar-EG')}
                                                </span>
                                            </div>
                                            {saved.jobId.salaryMin && saved.jobId.salaryMax && (
                                                <p className="text-primary-600 font-semibold mt-2">
                                                    {saved.jobId.salaryMin.toLocaleString()} - {saved.jobId.salaryMax.toLocaleString()} ج.م
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/jobs/${saved.jobId._id}`}
                                            className="btn-outline-sm"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(saved._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="إزالة من المحفوظات"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
