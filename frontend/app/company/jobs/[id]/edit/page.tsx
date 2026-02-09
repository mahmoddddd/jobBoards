'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import {
    Briefcase,
    MapPin,
    DollarSign,
    FileText,
    ArrowRight,
    Save,
    Loader2,
    Trash2,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';

const jobSchema = z.object({
    title: z.string().min(5, 'عنوان الوظيفة مطلوب (5 أحرف على الأقل)'),
    description: z.string().min(50, 'الوصف يجب أن يكون 50 حرف على الأقل'),
    requirements: z.string().optional(),
    location: z.string().min(2, 'الموقع مطلوب'),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP']),
    experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD']),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
    skills: z.string().optional(),
});

type JobForm = z.infer<typeof jobSchema>;

export default function EditJobPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [job, setJob] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<JobForm>({
        resolver: zodResolver(jobSchema),
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'COMPANY' && user.role !== 'ADMIN') {
                router.push('/');
            } else {
                fetchJob();
            }
        }
    }, [user, authLoading, router, jobId]);

    const fetchJob = async () => {
        try {
            const res = await api.get(`/jobs/${jobId}`);
            const jobData = res.data.job;
            setJob(jobData);
            reset({
                title: jobData.title,
                description: jobData.description,
                requirements: jobData.requirements || '',
                location: jobData.location,
                jobType: jobData.jobType,
                experienceLevel: jobData.experienceLevel,
                salaryMin: jobData.salaryMin || 0,
                salaryMax: jobData.salaryMax || 0,
                skills: jobData.skills?.join(', ') || '',
            });
        } catch (error) {
            toast.error('خطأ في تحميل الوظيفة');
            router.push('/company/dashboard');
        } finally {
            setFetching(false);
        }
    };

    const onSubmit = async (data: JobForm) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
            };
            await api.put(`/jobs/${jobId}`, payload);
            toast.success('تم تحديث الوظيفة بنجاح');
            router.push('/company/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/jobs/${jobId}`);
            toast.success('تم حذف الوظيفة');
            router.push('/company/dashboard');
        } catch (error) {
            toast.error('حدث خطأ في الحذف');
        }
    };

    if (authLoading || fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/company/dashboard" className="text-primary-600 hover:underline flex items-center gap-1 mb-4">
                        <ArrowRight className="w-4 h-4" />
                        العودة للوحة التحكم
                    </Link>
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">تعديل الوظيفة</h1>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="btn-danger-outline"
                        >
                            <Trash2 className="w-5 h-5 ml-2" />
                            حذف
                        </button>
                    </div>
                </div>

                {/* Status Badge */}
                {job && (
                    <div className="mb-6">
                        <span className={`badge ${job.status === 'APPROVED' ? 'badge-green' :
                                job.status === 'PENDING' ? 'badge-yellow' :
                                    job.status === 'REJECTED' ? 'badge-red' : 'badge-gray'
                            }`}>
                            {job.status === 'APPROVED' ? 'معتمدة' :
                                job.status === 'PENDING' ? 'في انتظار الموافقة' :
                                    job.status === 'REJECTED' ? 'مرفوضة' : 'مغلقة'}
                        </span>
                    </div>
                )}

                {/* Form */}
                <div className="card p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عنوان الوظيفة *
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    {...register('title')}
                                    className={`input pr-12 ${errors.title ? 'input-error' : ''}`}
                                    placeholder="مثال: مطور واجهات أمامية"
                                />
                            </div>
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الموقع *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        {...register('location')}
                                        className={`input pr-12 ${errors.location ? 'input-error' : ''}`}
                                        placeholder="القاهرة، مصر"
                                    />
                                </div>
                                {errors.location && (
                                    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نوع الوظيفة *
                                </label>
                                <select
                                    {...register('jobType')}
                                    className={`input ${errors.jobType ? 'input-error' : ''}`}
                                >
                                    <option value="FULL_TIME">دوام كامل</option>
                                    <option value="PART_TIME">دوام جزئي</option>
                                    <option value="CONTRACT">عقد</option>
                                    <option value="REMOTE">عن بعد</option>
                                    <option value="INTERNSHIP">تدريب</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    مستوى الخبرة *
                                </label>
                                <select
                                    {...register('experienceLevel')}
                                    className={`input ${errors.experienceLevel ? 'input-error' : ''}`}
                                >
                                    <option value="ENTRY">مبتدئ</option>
                                    <option value="MID">متوسط</option>
                                    <option value="SENIOR">خبير</option>
                                    <option value="LEAD">قائد فريق</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المهارات المطلوبة
                                </label>
                                <input
                                    type="text"
                                    {...register('skills')}
                                    className="input"
                                    placeholder="React, JavaScript, CSS (مفصولة بفاصلة)"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحد الأدنى للراتب
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        {...register('salaryMin', { valueAsNumber: true })}
                                        className="input pr-12"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحد الأعلى للراتب
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        {...register('salaryMax', { valueAsNumber: true })}
                                        className="input pr-12"
                                        placeholder="10000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                وصف الوظيفة *
                            </label>
                            <textarea
                                {...register('description')}
                                rows={6}
                                className={`input ${errors.description ? 'input-error' : ''}`}
                                placeholder="وصف تفصيلي للوظيفة والمهام..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المتطلبات
                            </label>
                            <textarea
                                {...register('requirements')}
                                rows={4}
                                className="input"
                                placeholder="المتطلبات والمؤهلات المطلوبة..."
                            />
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

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-red-600">حذف الوظيفة</h3>
                                <button onClick={() => setShowDeleteModal(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6">
                                هل أنت متأكد من حذف هذه الوظيفة؟ سيتم حذف جميع الطلبات المرتبطة بها.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleDelete}
                                    className="btn-danger flex-1"
                                >
                                    نعم، احذف
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
