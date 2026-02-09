'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Lock,
    Save,
    Loader2,
    ArrowRight,
    FileText,
    Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';

const profileSchema = z.object({
    name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    phone: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
        reset: resetProfile,
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
    } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (user) {
            resetProfile({
                name: user.name || '',
                phone: user.phone || '',
            });
        }
    }, [user, authLoading, router, resetProfile]);

    const onProfileSubmit = async (data: ProfileForm) => {
        setLoading(true);
        try {
            await api.put('/auth/profile', data);
            toast.success('تم تحديث البروفايل بنجاح');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordForm) => {
        setPasswordLoading(true);
        try {
            await api.put('/auth/password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success('تم تغيير كلمة المرور بنجاح');
            resetPassword();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!user) return null;

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <span className="badge badge-red">مدير النظام</span>;
            case 'COMPANY':
                return <span className="badge badge-blue">شركة</span>;
            default:
                return <span className="badge badge-green">باحث عن عمل</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="text-primary-600 hover:underline flex items-center gap-1 mb-4">
                        <ArrowRight className="w-4 h-4" />
                        العودة للرئيسية
                    </Link>
                    <h1 className="text-3xl font-bold">الملف الشخصي</h1>
                    <p className="text-gray-600 mt-2">إدارة بيانات حسابك</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mx-auto flex items-center justify-center text-white text-2xl font-bold">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <h3 className="font-bold mt-4">{user.name}</h3>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                            <div className="mt-3">
                                {getRoleBadge(user.role)}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="card p-4 mt-4">
                            <h4 className="font-semibold mb-3">روابط سريعة</h4>
                            <div className="space-y-2">
                                {user.role === 'USER' && (
                                    <>
                                        <Link href="/applications" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 py-2">
                                            <FileText className="w-4 h-4" />
                                            طلباتي
                                        </Link>
                                        <Link href="/saved-jobs" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 py-2">
                                            <Briefcase className="w-4 h-4" />
                                            الوظائف المحفوظة
                                        </Link>
                                    </>
                                )}
                                {user.role === 'COMPANY' && (
                                    <Link href="/company/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 py-2">
                                        <Briefcase className="w-4 h-4" />
                                        لوحة التحكم
                                    </Link>
                                )}
                                {user.role === 'ADMIN' && (
                                    <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 py-2">
                                        <Shield className="w-4 h-4" />
                                        لوحة الإدارة
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Tabs */}
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'profile'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <User className="w-4 h-4 inline ml-2" />
                                البيانات الشخصية
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'password'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Lock className="w-4 h-4 inline ml-2" />
                                كلمة المرور
                            </button>
                        </div>

                        {/* Profile Form */}
                        {activeTab === 'profile' && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-6">تعديل البيانات الشخصية</h2>
                                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الاسم الكامل
                                        </label>
                                        <div className="relative">
                                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                {...registerProfile('name')}
                                                className={`input pr-12 ${profileErrors.name ? 'input-error' : ''}`}
                                                placeholder="اسمك الكامل"
                                            />
                                        </div>
                                        {profileErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            البريد الإلكتروني
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={user.email}
                                                disabled
                                                className="input pr-12 bg-gray-100 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-gray-500 text-xs mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رقم الهاتف
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                {...registerProfile('phone')}
                                                className="input pr-12"
                                                placeholder="01xxxxxxxxx"
                                            />
                                        </div>
                                    </div>

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
                                </form>
                            </div>
                        )}

                        {/* Password Form */}
                        {activeTab === 'password' && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-6">تغيير كلمة المرور</h2>
                                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            كلمة المرور الحالية
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                autoComplete="current-password"
                                                {...registerPassword('currentPassword')}
                                                className={`input pr-12 ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {passwordErrors.currentPassword && (
                                            <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            كلمة المرور الجديدة
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                autoComplete="new-password"
                                                {...registerPassword('newPassword')}
                                                className={`input pr-12 ${passwordErrors.newPassword ? 'input-error' : ''}`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {passwordErrors.newPassword && (
                                            <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            تأكيد كلمة المرور الجديدة
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                autoComplete="new-password"
                                                {...registerPassword('confirmPassword')}
                                                className={`input pr-12 ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {passwordErrors.confirmPassword && (
                                            <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="btn-primary"
                                    >
                                        {passwordLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                                جاري التغيير...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-5 h-5 ml-2" />
                                                تغيير كلمة المرور
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
