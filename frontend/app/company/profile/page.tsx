'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import {
    Building2,
    Mail,
    Globe,
    Phone,
    MapPin,
    Users,
    Save,
    Loader2,
    ArrowRight,
    Image,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';

const companySchema = z.object({
    name: z.string().min(2, 'اسم الشركة مطلوب'),
    description: z.string().min(20, 'الوصف يجب أن يكون 20 حرف على الأقل'),
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    phone: z.string().optional(),
    website: z.string().url('الرابط غير صحيح').optional().or(z.literal('')),
    location: z.string().optional(),
    industry: z.string().optional(),
    size: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function CompanyProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [company, setCompany] = useState<any>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CompanyForm>({
        resolver: zodResolver(companySchema),
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'COMPANY') {
                router.push('/');
            } else {
                fetchCompanyProfile();
            }
        }
    }, [user, authLoading, router]);

    const fetchCompanyProfile = async () => {
        try {
            const res = await api.get('/companies/me');
            setCompany(res.data.company);
            reset({
                name: res.data.company.name || '',
                description: res.data.company.description || '',
                email: res.data.company.email || '',
                phone: res.data.company.phone || '',
                website: res.data.company.website || '',
                location: res.data.company.location || '',
                industry: res.data.company.industry || '',
                size: res.data.company.size || '',
            });
        } catch (error) {
            console.error('Error fetching company:', error);
        } finally {
            setFetching(false);
        }
    };

    const onSubmit = async (data: CompanyForm) => {
        setLoading(true);
        try {
            await api.put('/companies/me', data);
            toast.success('تم تحديث بيانات الشركة بنجاح');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="badge badge-green">معتمدة</span>;
            case 'PENDING':
                return <span className="badge badge-yellow">في انتظار الموافقة</span>;
            case 'BLOCKED':
                return <span className="badge badge-red">محظورة</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/company/dashboard" className="text-primary-600 hover:underline flex items-center gap-1 mb-4">
                        <ArrowRight className="w-4 h-4" />
                        العودة للوحة التحكم
                    </Link>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                                {company?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">بروفايل الشركة</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    {company && getStatusBadge(company.status)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Alert */}
                {company?.status === 'PENDING' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <p className="text-yellow-800">
                            ⏳ شركتك في انتظار موافقة الإدارة. ستتمكن من نشر الوظائف بمجرد الموافقة.
                        </p>
                    </div>
                )}

                {company?.status === 'BLOCKED' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-800">
                            🚫 تم حظر شركتك. يرجى التواصل مع الإدارة للمزيد من المعلومات.
                        </p>
                    </div>
                )}

                {/* Form */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-6">تعديل بيانات الشركة</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم الشركة *
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        {...register('name')}
                                        className={`input pr-12 ${errors.name ? 'input-error' : ''}`}
                                        placeholder="اسم الشركة"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    البريد الإلكتروني *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className={`input pr-12 ${errors.email ? 'input-error' : ''}`}
                                        placeholder="info@company.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رقم الهاتف
                                </label>
                                <div className="relative">
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className="input pr-12"
                                        placeholder="01xxxxxxxxx"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الموقع الإلكتروني
                                </label>
                                <div className="relative">
                                    <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        {...register('website')}
                                        className={`input pr-12 ${errors.website ? 'input-error' : ''}`}
                                        placeholder="https://example.com"
                                    />
                                </div>
                                {errors.website && (
                                    <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الموقع
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        {...register('location')}
                                        className="input pr-12"
                                        placeholder="القاهرة، مصر"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المجال
                                </label>
                                <input
                                    type="text"
                                    {...register('industry')}
                                    className="input"
                                    placeholder="تقنية المعلومات"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    حجم الشركة
                                </label>
                                <div className="relative">
                                    <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select {...register('size')} className="input pr-12">
                                        <option value="">اختر الحجم</option>
                                        <option value="1-10">1-10 موظفين</option>
                                        <option value="11-50">11-50 موظف</option>
                                        <option value="51-200">51-200 موظف</option>
                                        <option value="201-500">201-500 موظف</option>
                                        <option value="500+">أكثر من 500 موظف</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                وصف الشركة *
                            </label>
                            <div className="relative">
                                <FileText className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                                <textarea
                                    {...register('description')}
                                    rows={5}
                                    className={`input pr-12 ${errors.description ? 'input-error' : ''}`}
                                    placeholder="وصف تفصيلي عن الشركة ونشاطها..."
                                />
                            </div>
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 ml-2" />
                                        حفظ التغييرات
                                    </>
                                )}
                            </button>
                            <Link href="/company/dashboard" className="btn-secondary">
                                إلغاء
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
