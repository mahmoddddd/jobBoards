'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Mail, Lock, User, Building2, Loader2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const baseSchema = z.object({
    name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    email: z.string().email('يرجى إدخال إيميل صحيح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
});

const userSchema = baseSchema.refine((d) => d.password === d.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
});

const companySchema = baseSchema.extend({
    companyName: z.string().min(2, 'اسم الشركة مطلوب'),
    companyDescription: z.string().min(10, 'وصف الشركة يجب أن يكون 10 أحرف على الأقل'),
    companyEmail: z.string().email('يرجى إدخال إيميل صحيح'),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
});

type UserForm = z.infer<typeof userSchema>;
type CompanyForm = z.infer<typeof companySchema>;

export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const searchParams = useSearchParams();
    const [accountType, setAccountType] = useState<'user' | 'company'>(
        searchParams.get('type') === 'company' ? 'company' : 'user'
    );
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CompanyForm>({
        resolver: zodResolver(accountType === 'company' ? companySchema : userSchema),
    });

    const onSubmit = async (data: CompanyForm) => {
        setLoading(true);
        try {
            const payload: any = {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: accountType === 'company' ? 'COMPANY' : 'USER',
            };

            if (accountType === 'company') {
                payload.companyData = {
                    name: data.companyName,
                    description: data.companyDescription,
                    email: data.companyEmail,
                };
            }

            await registerUser(payload);
            toast.success('تم إنشاء الحساب بنجاح!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ في التسجيل');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 pb-12 pt-32 px-4">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">JobBoard</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="card p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">إنشاء حساب جديد</h1>
                    <p className="text-gray-600 text-center mb-6">اختر نوع الحساب وأدخل بياناتك</p>

                    {/* Account Type Selector */}
                    <div className="flex gap-3 mb-8">
                        <button
                            type="button"
                            onClick={() => { setAccountType('user'); reset(); }}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${accountType === 'user'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <User className="w-5 h-5" />
                            <span className="font-medium">باحث عن عمل</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAccountType('company'); reset(); }}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${accountType === 'company'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Building2 className="w-5 h-5" />
                            <span className="font-medium">شركة</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* User Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        {...register('name')}
                                        className={`input pr-12 ${errors.name ? 'input-error' : ''}`}
                                        placeholder="الاسم الكامل"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الهاتف (اختياري)</label>
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    {...register('email')}
                                    className={`input pr-12 ${errors.email ? 'input-error' : ''}`}
                                    placeholder="example@email.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        {...register('password')}
                                        className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        {...register('confirmPassword')}
                                        className={`input pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        {/* Company Info */}
                        {accountType === 'company' && (
                            <div className="pt-4 border-t border-gray-200 space-y-4">
                                <h3 className="font-semibold text-gray-900">بيانات الشركة</h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشركة</label>
                                        <input
                                            type="text"
                                            {...register('companyName')}
                                            className={`input ${errors.companyName ? 'input-error' : ''}`}
                                            placeholder="اسم الشركة"
                                        />
                                        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">إيميل الشركة</label>
                                        <input
                                            type="email"
                                            {...register('companyEmail')}
                                            className={`input ${errors.companyEmail ? 'input-error' : ''}`}
                                            placeholder="info@company.com"
                                        />
                                        {errors.companyEmail && <p className="text-red-500 text-sm mt-1">{errors.companyEmail.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">وصف الشركة</label>
                                    <textarea
                                        {...register('companyDescription')}
                                        className={`input min-h-[100px] ${errors.companyDescription ? 'input-error' : ''}`}
                                        placeholder="نبذة عن الشركة ومجال عملها..."
                                    />
                                    {errors.companyDescription && <p className="text-red-500 text-sm mt-1">{errors.companyDescription.message}</p>}
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                                    ⚠️ سيتم مراجعة طلب تسجيل الشركة من قبل الإدارة قبل الموافقة
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full mt-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                    جاري التسجيل...
                                </>
                            ) : (
                                'إنشاء الحساب'
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-gray-600">
                        لديك حساب بالفعل؟{' '}
                        <Link href="/login" className="text-primary-600 font-medium hover:underline">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
