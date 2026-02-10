'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/api';
import { Briefcase, Mail, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const forgotSchema = z.object({
    email: z.string().email('يرجى إدخال إيميل صحيح'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotForm>({
        resolver: zodResolver(forgotSchema),
    });

    const onSubmit = async (data: ForgotForm) => {
        setLoading(true);
        try {
            await authAPI.forgotPassword(data.email);
            setSent(true);
            toast.success('تم إرسال رابط إعادة التعيين!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12 pt-32 px-4">
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
                <div className="card p-8">
                    {sent ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2 dark:text-white">تم الإرسال!</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.
                            </p>
                            <Link href="/login" className="btn-primary w-full">
                                <ArrowRight className="w-5 h-5 ml-2" />
                                العودة لتسجيل الدخول
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-center mb-2 dark:text-white">نسيت كلمة المرور؟</h1>
                            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">أدخل إيميلك وسنرسل لك رابط لإعادة التعيين</p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        البريد الإلكتروني
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            {...register('email')}
                                            className={`input pr-12 ${errors.email ? 'input-error' : ''}`}
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        'إرسال رابط إعادة التعيين'
                                    )}
                                </button>
                            </form>

                            <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
                                تذكرت كلمة المرور؟{' '}
                                <Link href="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                                    تسجيل الدخول
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
