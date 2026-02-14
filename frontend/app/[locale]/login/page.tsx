'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Schema moved inside component to use translations

export default function LoginPage() {
    const t = useTranslations('Auth');
    const tc = useTranslations('Common');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const loginSchema = z.object({
        email: z.string().email(t('emailInvalid')),
        password: z.string().min(6, t('passwordMin')),
    });

    type LoginForm = z.infer<typeof loginSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        try {
            await login(data.email, data.password);
            toast.success(tc('success'));
        } catch (error: any) {
            toast.error(error.response?.data?.message || tc('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 pb-12 pt-32 px-4">
            <div className="w-full max-w-md">
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
                <div className="card p-6 md:p-8">
                    <h1 className="text-xl md:text-2xl font-bold text-center mb-2">{t('loginTitle')}</h1>
                    <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8">{t('loginSubtitle')}</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 ltr:left-4" />
                                <input
                                    type="email"
                                    autoComplete="email"
                                    {...register('email')}
                                    className={`input pr-12 rtl:pr-12 ltr:pl-12 ${errors.email ? 'input-error' : ''}`}
                                    placeholder="example@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:right-4 ltr:left-4" />
                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    {...register('password')}
                                    className={`input pr-12 rtl:pr-12 ltr:pl-12 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                    {tc('loading')}
                                </>
                            ) : (
                                t('loginButton')
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-gray-600">
                        {t('noAccount')}{' '}
                        <Link href="/register" className="text-primary-600 font-medium hover:underline">
                            {t('registerButton')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
