'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Mail, Lock, User, Building2, Loader2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

// Schemas moved inside component

export default function RegisterPage() {
    const t = useTranslations('Auth');
    const tc = useTranslations('Common');
    const { register: registerUser } = useAuth();
    const searchParams = useSearchParams();
    const [accountType, setAccountType] = useState<'user' | 'freelancer' | 'company'>(
        searchParams.get('type') === 'company' ? 'company' : searchParams.get('type') === 'freelancer' ? 'freelancer' : 'user'
    );
    const [loading, setLoading] = useState(false);

    const baseSchema = z.object({
        name: z.string().min(2, t('nameMin')),
        email: z.string().email(t('emailInvalid')),
        password: z.string().min(6, t('passwordMin')),
        confirmPassword: z.string(),
        phone: z.string().optional(),
    });

    const userSchema = baseSchema.refine((d) => d.password === d.confirmPassword, {
        message: t('passwordMismatch'),
        path: ['confirmPassword'],
    });

    const companySchema = baseSchema.extend({
        companyName: z.string().min(2, t('companyNameRequired')),
        companyDescription: z.string().min(10, t('descriptionMin')),
        companyEmail: z.string().email(t('emailInvalid')),
    }).refine((d) => d.password === d.confirmPassword, {
        message: t('passwordMismatch'),
        path: ['confirmPassword'],
    });

    type CompanyForm = z.infer<typeof companySchema>; // Using the extended type for generic usage

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
                isFreelancer: accountType === 'freelancer',
            };

            if (accountType === 'company') {
                payload.companyData = {
                    name: data.companyName,
                    description: data.companyDescription,
                    email: data.companyEmail,
                };
            }

            await registerUser(payload);
            toast.success(tc('success'));
        } catch (error: any) {
            toast.error(error.response?.data?.message || tc('error'));
        } finally {
            setLoading(false);
        }
    };

    const isRtl = tc('loading') === 'جاري التحميل...';

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
                <div className="card p-5 md:p-8">
                    <h1 className="text-xl md:text-2xl font-bold text-center mb-1.5">{t('registerTitle')}</h1>
                    <p className="text-sm md:text-base text-gray-600 text-center mb-6">{t('registerSubtitle')}</p>

                    {/* Account Type Selector */}
                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8">
                        <button
                            type="button"
                            onClick={() => { setAccountType('user'); reset(); }}
                            className={`flex flex-col items-center justify-center gap-1.5 p-2 md:p-4 rounded-xl border-2 transition-all ${accountType === 'user'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <User className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="font-bold text-[10px] md:text-sm">{t('jobSeeker')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAccountType('freelancer'); reset(); }}
                            className={`flex flex-col items-center justify-center gap-1.5 p-2 md:p-4 rounded-xl border-2 transition-all ${accountType === 'freelancer'
                                ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="font-bold text-[10px] md:text-sm">{t('freelancer')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAccountType('company'); reset(); }}
                            className={`flex flex-col items-center justify-center gap-1.5 p-2 md:p-4 rounded-xl border-2 transition-all ${accountType === 'company'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="font-bold text-[10px] md:text-sm">{t('company')}</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* User Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')}</label>
                                <div className="relative">
                                    <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                                    <input
                                        type="text"
                                        {...register('name')}
                                        className={`input ${isRtl ? 'pr-12' : 'pl-12'} ${errors.name ? 'input-error' : ''}`}
                                        placeholder={t('name')}
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('phoneOptional')}</label>
                                <div className="relative">
                                    <Phone className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className={`input ${isRtl ? 'pr-12' : 'pl-12'}`}
                                        placeholder="01xxxxxxxxx"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
                            <div className="relative">
                                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                                <input
                                    type="email"
                                    {...register('email')}
                                    className={`input ${isRtl ? 'pr-12' : 'pl-12'} ${errors.email ? 'input-error' : ''}`}
                                    placeholder="example@email.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
                                <div className="relative">
                                    <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                                    <input
                                        type="password"
                                        {...register('password')}
                                        className={`input ${isRtl ? 'pr-12' : 'pl-12'} ${errors.password ? 'input-error' : ''}`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('confirmPassword')}</label>
                                <div className="relative">
                                    <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                                    <input
                                        type="password"
                                        {...register('confirmPassword')}
                                        className={`input ${isRtl ? 'pr-12' : 'pl-12'} ${errors.confirmPassword ? 'input-error' : ''}`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        {/* Company Info */}
                        {accountType === 'company' && (
                            <div className="pt-4 border-t border-gray-200 space-y-4">
                                <h3 className="font-semibold text-gray-900">{t('companyData')}</h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('companyName')}</label>
                                        <input
                                            type="text"
                                            {...register('companyName')}
                                            className={`input ${errors.companyName ? 'input-error' : ''}`}
                                            placeholder={t('companyName')}
                                        />
                                        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('companyEmail')}</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('companyDescription')}</label>
                                    <textarea
                                        {...register('companyDescription')}
                                        className={`input min-h-[100px] ${errors.companyDescription ? 'input-error' : ''}`}
                                        placeholder={t('companyDescriptionPlaceholder')}
                                    />
                                    {errors.companyDescription && <p className="text-red-500 text-sm mt-1">{errors.companyDescription.message}</p>}
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                                    ⚠️ {t('companyReviewWarning')}
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
                                    {tc('loading')}
                                </>
                            ) : (
                                t('registerButton')
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-gray-600">
                        {t('haveAccount')}{' '}
                        <Link href="/login" className="text-primary-600 font-medium hover:underline">
                            {t('loginButton')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
