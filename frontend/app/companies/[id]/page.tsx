'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    MapPin,
    Globe,
    Mail,
    Phone,
    Users,
    Briefcase,
    ArrowRight,
    Clock,
    Loader2,
    ExternalLink
} from 'lucide-react';
import api from '@/lib/api';

interface Company {
    _id: string;
    name: string;
    description: string;
    email: string;
    phone?: string;
    website?: string;
    location?: string;
    industry?: string;
    size?: string;
    logo?: string;
}

interface Job {
    _id: string;
    title: string;
    location: string;
    jobType: string;
    experienceLevel: string;
    salaryMin?: number;
    salaryMax?: number;
    createdAt: string;
}

export default function CompanyPage() {
    const params = useParams();
    const companyId = params.id as string;

    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchCompanyData();
    }, [companyId]);

    const fetchCompanyData = async () => {
        try {
            const [companyRes, jobsRes] = await Promise.all([
                api.get(`/companies/${companyId}`),
                api.get(`/jobs?companyId=${companyId}&status=APPROVED`)
            ]);
            setCompany(companyRes.data.company);
            setJobs(jobsRes.data.jobs || []);
        } catch (error) {
            console.error('Error fetching company:', error);
            setError(true);
        } finally {
            setLoading(false);
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

    const getExperienceLabel = (level: string) => {
        const levels: { [key: string]: string } = {
            'ENTRY': 'مبتدئ',
            'MID': 'متوسط',
            'SENIOR': 'خبير',
            'LEAD': 'قائد فريق',
        };
        return levels[level] || level;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">الشركة غير موجودة</h2>
                    <Link href="/jobs" className="text-primary-600 hover:underline">
                        العودة للوظائف
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <Link href="/jobs" className="text-white/80 hover:text-white flex items-center gap-1 mb-6">
                        <ArrowRight className="w-4 h-4" />
                        العودة للوظائف
                    </Link>

                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/20">
                            {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <span className="text-4xl font-bold">{company.name.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
                            <div className="flex flex-wrap gap-4 text-white/80">
                                {company.industry && (
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-4 h-4" />
                                        {company.industry}
                                    </span>
                                )}
                                {company.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {company.location}
                                    </span>
                                )}
                                {company.size && (
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {company.size} موظف
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* About */}
                        <div className="card p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4">عن الشركة</h2>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                                {company.description}
                            </p>
                        </div>

                        {/* Open Positions */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">الوظائف المتاحة</h2>
                                <span className="badge badge-primary">{jobs.length} وظيفة</span>
                            </div>

                            {jobs.length === 0 ? (
                                <div className="text-center py-8">
                                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">لا توجد وظائف متاحة حالياً</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {jobs.map((job) => (
                                        <Link
                                            key={job._id}
                                            href={`/jobs/${job._id}`}
                                            className="block p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-primary-600 transition">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {job.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Briefcase className="w-4 h-4" />
                                                            {getJobTypeLabel(job.jobType)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {getExperienceLabel(job.experienceLevel)}
                                                        </span>
                                                    </div>
                                                    {job.salaryMin && job.salaryMax && (
                                                        <p className="text-primary-600 font-semibold mt-2">
                                                            {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} ج.م
                                                        </p>
                                                    )}
                                                </div>
                                                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-4">
                            <h3 className="font-bold mb-4">معلومات التواصل</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                                        <a href={`mailto:${company.email}`} className="hover:text-primary-600">
                                            {company.email}
                                        </a>
                                    </div>
                                </div>

                                {company.phone && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">الهاتف</p>
                                            <a href={`tel:${company.phone}`} className="hover:text-primary-600">
                                                {company.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {company.website && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">الموقع الإلكتروني</p>
                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-primary-600"
                                            >
                                                زيارة الموقع
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
