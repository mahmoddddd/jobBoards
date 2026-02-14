'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { jobsAPI } from '@/lib/api';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import ApplicationBoard from '@/components/company/ApplicationBoard';
import { useLocale } from 'next-intl';

export default function JobApplicationsPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations('Company');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const jobId = params.id as string;
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

    const fetchJob = async () => {
        try {
            const response = await jobsAPI.getOne(jobId);
            setJob(response.data.job);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isRtl ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                            {job?.title} - {t('applications')}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage all applications in one board</p>
                    </div>
                </div>
            </div>

            <ApplicationBoard jobId={jobId} />
        </div>
    );
}
