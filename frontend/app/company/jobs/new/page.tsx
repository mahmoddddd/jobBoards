'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jobsAPI } from '@/lib/api';
import { ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const jobSchema = z.object({
    title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
    description: z.string().min(20, 'الوصف يجب أن يكون 20 حرف على الأقل'),
    requirements: z.string().optional(),
    location: z.string().min(2, 'الموقع مطلوب'),
    jobType: z.string(),
    experienceLevel: z.string(),
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    skills: z.string().optional(),
});

type JobForm = z.infer<typeof jobSchema>;

export default function NewJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<JobForm>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            jobType: 'FULL_TIME',
            experienceLevel: 'ENTRY',
        },
    });

    const onSubmit = async (data: JobForm) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
                salaryMax: data.salaryMax ? parseInt(data.salaryMax) : undefined,
                skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
            };

            await jobsAPI.create(payload);
            toast.success('تم إنشاء الوظيفة بنجاح! ستتم مراجعتها قريباً');
            router.push('/company/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/company/dashboard" className="hover:text-primary-600">لوحة التحكم</Link>
                    <span>/</span>
                    <span className="text-gray-900">إضافة وظيفة جديدة</span>
                </div>

                <div className="card p-8">
                    <h1 className="text-2xl font-bold mb-6">إضافة وظيفة جديدة</h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الوظيفة *</label>
                            <input
                                type="text"
                                {...register('title')}
                                className={`input ${errors.title ? 'input-error' : ''}`}
                                placeholder="مثال: مطور واجهات أمامية"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الوظيفة *</label>
                                <select {...register('jobType')} className="input">
                                    <option value="FULL_TIME">دوام كامل</option>
                                    <option value="PART_TIME">دوام جزئي</option>
                                    <option value="CONTRACT">عقد</option>
                                    <option value="REMOTE">عن بعد</option>
                                    <option value="INTERNSHIP">تدريب</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">مستوى الخبرة *</label>
                                <select {...register('experienceLevel')} className="input">
                                    <option value="ENTRY">مبتدئ</option>
                                    <option value="MID">متوسط</option>
                                    <option value="SENIOR">خبير</option>
                                    <option value="LEAD">قائد</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">موقع العمل *</label>
                            <input
                                type="text"
                                {...register('location')}
                                className={`input ${errors.location ? 'input-error' : ''}`}
                                placeholder="مثال: القاهرة، مصر"
                            />
                            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للراتب</label>
                                <input
                                    type="number"
                                    {...register('salaryMin')}
                                    className="input"
                                    placeholder="مثال: 5000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى للراتب</label>
                                <input
                                    type="number"
                                    {...register('salaryMax')}
                                    className="input"
                                    placeholder="مثال: 10000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">وصف الوظيفة *</label>
                            <textarea
                                {...register('description')}
                                className={`input min-h-[150px] ${errors.description ? 'input-error' : ''}`}
                                placeholder="اكتب وصفاً تفصيلياً للوظيفة..."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">المتطلبات</label>
                            <textarea
                                {...register('requirements')}
                                className="input min-h-[100px]"
                                placeholder="اكتب المتطلبات والمؤهلات المطلوبة..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">المهارات المطلوبة</label>
                            <input
                                type="text"
                                {...register('skills')}
                                className="input"
                                placeholder="مثال: React, JavaScript, CSS (افصل بفاصلة)"
                            />
                            <p className="text-sm text-gray-500 mt-1">افصل بين المهارات بفاصلة</p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                            ⚠️ ملاحظة: الوظيفة ستكون قيد المراجعة حتى يتم الموافقة عليها من قبل الإدارة
                        </div>

                        <div className="flex gap-4">
                            <Link href="/company/dashboard" className="btn-secondary flex-1">
                                إلغاء
                            </Link>
                            <button type="submit" disabled={loading} className="btn-primary flex-1">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                        جاري النشر...
                                    </>
                                ) : (
                                    'نشر الوظيفة'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
