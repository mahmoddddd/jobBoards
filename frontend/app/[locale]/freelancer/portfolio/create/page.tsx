'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Upload, X, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
    title: z.string().min(3, 'Title is required (min 3 chars)'),
    description: z.string().min(10, 'Description is required (min 10 chars)'),
    link: z.string().url('Invalid URL').optional().or(z.literal('')),
    videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    completionDate: z.string().optional(),
    skills: z.string().min(1, 'At least one skill is required'),
});

type FormData = z.infer<typeof schema>;

export default function CreatePortfolioItemPage() {
    const t = useTranslations('PortfolioManagement');
    const router = useRouter();
    const { user } = useAuth();

    const [submitting, setSubmitting] = useState(false);
    const [coverImage, setCoverImage] = useState<string>('');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            if (isCover) setUploadingCover(true);
            else setUploadingGallery(true);

            const res = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (isCover) {
                setCoverImage(res.data.url);
            } else {
                setGalleryImages(prev => [...prev, res.data.url]);
            }
            toast.success('Image uploaded');
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            if (isCover) setUploadingCover(false);
            else setUploadingGallery(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!coverImage) {
            return toast.error('Cover image is required');
        }

        setSubmitting(true);
        try {
            await api.post('/portfolio', {
                ...data,
                coverImage,
                images: galleryImages,
                skills: data.skills.split(',').map(s => s.trim()).filter(Boolean)
            });
            toast.success('Project created successfully');
            router.push('/freelancer/portfolio');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create project');
        } finally {
            setSubmitting(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('addNewProject')}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('projectTitle')}</label>
                    <input {...register('title')} className="input-field" placeholder="e.g. E-commerce Website" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('description')}</label>
                    <textarea {...register('description')} rows={6} className="input-field" placeholder="Describe the project details, challenges, and outcome..." />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('coverImage')}</label>
                    <div className="flex items-center gap-4">
                        {coverImage ? (
                            <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200">
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setCoverImage('')} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <label className="w-40 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                {uploadingCover ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : <Upload className="w-6 h-6 text-gray-400" />}
                                <span className="text-xs text-gray-500 mt-2">Upload Cover</span>
                                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, true)} className="hidden" disabled={uploadingCover} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Gallery Images */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('images')}</label>
                    <div className="flex flex-wrap gap-4">
                        {galleryImages.map((img, i) => (
                            <div key={i} className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <label className="w-32 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            {uploadingGallery ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : <Plus className="w-5 h-5 text-gray-400" />}
                            <span className="text-xs text-gray-500 mt-1">Add Image</span>
                            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, false)} className="hidden" disabled={uploadingGallery} />
                        </label>
                    </div>
                </div>

                {/* Skills */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('skills')}</label>
                    <input {...register('skills')} className="input-field" placeholder="React, Node.js, Design..." />
                    {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills.message}</p>}
                </div>

                {/* Links & Date */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('link')}</label>
                        <input {...register('link')} className="input-field" placeholder="https://..." />
                        {errors.link && <p className="text-red-500 text-xs mt-1">{errors.link.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('videoUrl')}</label>
                        <input {...register('videoUrl')} className="input-field" placeholder="https://youtube.com/..." />
                        {errors.videoUrl && <p className="text-red-500 text-xs mt-1">{errors.videoUrl.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('completionDate')}</label>
                        <input type="date" {...register('completionDate')} className="input-field" />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                        {t('cancel')}
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {t('save')}
                    </button>
                </div>
            </form>
        </div>
    );
}
