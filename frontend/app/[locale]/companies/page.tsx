'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { companiesAPI } from '@/lib/api';
import {
    Search,
    MapPin,
    Briefcase,
    Building2,
    Users,
    Loader2
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { CompanyCardSkeleton } from '@/components/skeletons/CardSkeletons';

interface Company {
    _id: string;
    name: string;
    description: string;
    industry: string;
    location: string;
    logo?: string;
    jobCount?: number;
}

const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Media',
    'Other'
];

export default function CompaniesPage() {
    const t = useTranslations('Companies');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const searchParams = useSearchParams();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [industry, setIndustry] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 12 };
            if (search) params.search = search;
            if (industry) params.industry = industry;

            const response = await companiesAPI.getAll(params);
            setCompanies(response.data.companies);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [page, industry]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCompanies();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className={`bg-gradient-to-br from-secondary-600 to-secondary-800 text-white pb-12 pt-32 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
                    <p className="text-secondary-100 mb-8">{t('subtitle')}</p>

                    {/* Search */}
                    <form onSubmit={handleSearch} className={`flex flex-col md:flex-row gap-3 max-w-3xl ${isRtl ? 'md:flex-row-reverse' : ''}`}>
                        <div className="flex-1 relative">
                            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('searchPlaceholder')}
                                className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary-500`}
                            />
                        </div>
                        <div className="md:w-64 relative">
                            <Briefcase className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                            <select
                                value={industry}
                                onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
                                className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary-500 appearance-none bg-white`}
                            >
                                <option value="">{t('allIndustries')}</option>
                                {industries.map(ind => (
                                    <option key={ind} value={ind}>{t(`industries.${ind}`)}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn bg-white text-secondary-700 hover:bg-gray-100 px-8">
                            {t('search')}
                        </button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <CompanyCardSkeleton key={i} />
                        ))}
                    </div>
                ) : companies.length === 0 ? (
                    <div className="text-center py-20">
                        <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('noResults')}</h3>
                        <p className="text-gray-500">{t('noResultsDesc')}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {companies.map((company) => (
                                <Link key={company._id} href={`/companies/${company._id}`}>
                                    <div className="card hover:shadow-xl transition-all h-full flex flex-col">
                                        <div className="p-6">
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                                                {company.logo ? (
                                                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    <Building2 className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                            <h3 className={`text-xl font-bold text-gray-900 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>{company.name}</h3>
                                            <div className={`flex items-center gap-2 text-sm text-gray-500 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                <Briefcase className="w-4 h-4" />
                                                <span>{t(`industries.${company.industry}`) || company.industry}</span>
                                                <span className="mx-1">•</span>
                                                <MapPin className="w-4 h-4" />
                                                <span>{company.location || t('notSpecified')}</span>
                                            </div>
                                            <p className={`text-gray-600 line-clamp-3 text-sm mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                                                {company.description}
                                            </p>
                                        </div>
                                        <div className={`mt-auto border-t bg-gray-50 p-4 flex items-center justify-between text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                                            <span className="text-secondary-600 font-medium hover:underline">
                                                {t('viewProfile')}
                                            </span>
                                            <div className="flex items-center gap-1 text-gray-500">
                                                {/* Startups typically don't show job count unless aggregated */}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
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
    );
}
