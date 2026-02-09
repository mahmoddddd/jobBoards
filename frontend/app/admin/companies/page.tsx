'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Building2,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Ban,
    Eye,
    Loader2,
    ArrowRight,
    Globe,
    Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Company {
    _id: string;
    name: string;
    email: string;
    website?: string;
    industry?: string;
    size?: string;
    status: string;
    jobCount?: number;
    createdAt: string;
}

export default function AdminCompaniesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'ADMIN') {
                router.push('/');
            } else {
                fetchCompanies();
            }
        }
    }, [user, authLoading, router]);

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies/admin/all');
            setCompanies(res.data.companies || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (companyId: string, newStatus: string) => {
        try {
            await api.put(`/companies/${companyId}/status`, { status: newStatus });
            setCompanies(prev => prev.map(company =>
                company._id === companyId ? { ...company, status: newStatus } : company
            ));
            toast.success('تم تحديث حالة الشركة');
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase()) ||
            company.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || company.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="badge badge-green">معتمدة</span>;
            case 'PENDING':
                return <span className="badge badge-yellow">معلقة</span>;
            case 'BLOCKED':
                return <span className="badge badge-red">محظورة</span>;
            default:
                return null;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const pendingCount = companies.filter(c => c.status === 'PENDING').length;
    const approvedCount = companies.filter(c => c.status === 'APPROVED').length;
    const blockedCount = companies.filter(c => c.status === 'BLOCKED').length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin/dashboard" className="text-primary-600 hover:underline flex items-center gap-1 mb-4">
                        <ArrowRight className="w-4 h-4" />
                        العودة للوحة الإدارة
                    </Link>
                    <h1 className="text-3xl font-bold">إدارة الشركات</h1>
                    <p className="text-gray-600 mt-1">{companies.length} شركة مسجلة</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{companies.length}</p>
                                <p className="text-gray-500 text-sm">إجمالي</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingCount}</p>
                                <p className="text-gray-500 text-sm">معلقة</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{approvedCount}</p>
                                <p className="text-gray-500 text-sm">معتمدة</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <Ban className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{blockedCount}</p>
                                <p className="text-gray-500 text-sm">محظورة</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="بحث بالاسم أو الإيميل..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pr-12 w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input"
                            >
                                <option value="">كل الحالات</option>
                                <option value="PENDING">معلقة</option>
                                <option value="APPROVED">معتمدة</option>
                                <option value="BLOCKED">محظورة</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Companies Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الشركة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">البريد</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">المجال</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الحجم</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الحالة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredCompanies.map((company) => (
                                    <tr key={company._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                                    <span className="font-bold text-primary-600">{company.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{company.name}</p>
                                                    {company.website && (
                                                        <a
                                                            href={company.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary-600 text-sm flex items-center gap-1 hover:underline"
                                                        >
                                                            <Globe className="w-3 h-3" />
                                                            الموقع
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                {company.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {company.industry || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {company.size || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(company.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(company.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/companies/${company._id}`}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                                    title="عرض"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {company.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleStatusChange(company._id, 'APPROVED')}
                                                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                                                        title="موافقة"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {company.status !== 'BLOCKED' && (
                                                    <button
                                                        onClick={() => handleStatusChange(company._id, 'BLOCKED')}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                        title="حظر"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {company.status === 'BLOCKED' && (
                                                    <button
                                                        onClick={() => handleStatusChange(company._id, 'APPROVED')}
                                                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                                                        title="إلغاء الحظر"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCompanies.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">لا توجد شركات</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
