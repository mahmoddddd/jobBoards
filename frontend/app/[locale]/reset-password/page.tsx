'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Lock, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useTranslations, useLocale } from 'next-intl';

const getResetSchema = (ta: any) => z.object({
    password: z.string().min(6, ta('passwordMin')),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: ta('passwordMismatch'),
    path: ['confirmPassword'],
});

type ResetForm = {
    password: string;
    confirmPassword: string;
};

function ResetPasswordForm() {
    const t = useTranslations('ResetPassword');
    const ta = useTranslations('Auth');
    const tj = useTranslations('Jobs');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetForm>({
        resolver: zodResolver(getResetSchema(ta)),
    });

    const onSubmit = async (data: ResetForm) => {
        if (!token) {
            toast.error(t('invalidTokenToast'));
            return;
        }
        setLoading(true);
        try {
            const response = await authAPI.resetPassword(token, data.password);
            // Auto login
            if (response.data.token) {
                Cookies.set('token', response.data.token, { expires: 7 });
                Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
            }
            setSuccess(true);
            toast.success(t('successToast'));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('errorToast'));
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className={`text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
                <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('invalidLink')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('invalidLinkDesc')}</p>
                <Link href="/forgot-password" className="btn-primary">
                    {t('requestNewLink')}
                </Link>
            </div>
        );
    }

    return (
        <>
            {success ? (
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 dark:text-white">{t('successTitle')}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t('successDesc')}</p>
                    <Link href="/jobs" className="btn-primary w-full">
                        {tj('title')}
                    </Link>
                </div>
            ) : (
                <>
                    <h1 className={`text-2xl font-bold text-center mb-2 dark:text-white ${isRtl ? 'md:text-right' : 'md:text-left'}`}>{t('title')}</h1>
                    <p className={`text-gray-600 dark:text-gray-400 text-center mb-8 ${isRtl ? 'md:text-right' : 'md:text-left'}`}>{t('subtitle')}</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                                {t('newPasswordLabel')}
                            </label>
                            <div className="relative">
                                <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                                <input
                                    type="password"
                                    {...register('password')}
                                    className={`input ${isRtl ? 'pr-12' : 'pl-12'} ${errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className={`text-red-500 text-sm mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                                {t('confirmPasswordLabel')}
                            </label>
                            <div className="relative">
                                <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                                <input
                                    type="password"
                                    {...register('confirmPassword')}
                                    className={`input ${isRtl ? 'pr-12' : 'pl-12'} ${errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className={`text-red-500 text-sm mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'} animate-spin`} />
                                    {t('updating')}
                                </>
                            ) : (
                                t('submitButton')
                            )}
                        </button>
                    </form>
                </>
            )}
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12 pt-32 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">JobBoard</span>
                    </Link>
                </div>
                <div className="card p-8">
                    <Suspense fallback={<div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
