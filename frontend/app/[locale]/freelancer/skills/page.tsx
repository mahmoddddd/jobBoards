'use client';

import { useState, useEffect } from 'react';
import { skillTestsAPI, companiesAPI } from '@/lib/api'; // Assuming companiesAPI for now, but maybe need a freelancerAPI to get profile
import { Loader2, Award, CheckCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function SkillTestsPage() {
    const t = useTranslations('SkillTests');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
    // We need to fetch the freelancer profile to know verified skills.
    // Assuming there is an endpoint for it. I'll check api.ts again later.

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            // Parallel fetch tests and profile
            // Note: need to find the correct endpoint for profile. `authAPI.getMe` returns user.
            // Maybe `companiesAPI.getMyCompany` is for companies. Freelancers likely have `freelancersAPI.getMyProfile()`?
            // Checking api.ts, I don't see `freelancersAPI.getMyProfile`.
            // I'll stick to just fetching tests for now and maybe update api.ts later if needed.
            const res = await skillTestsAPI.getAll();
            setTests(res.data.tests);
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
                <p className="text-gray-600">{t('subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => {
                    const isVerified = verifiedSkills.includes(test.skillName);

                    return (
                        <div key={test._id} className="card p-6 border hover:border-primary-500 transition-colors group relative overflow-hidden">
                            {isVerified && (
                                <div className="absolute top-0 right-0 p-2 bg-green-100 rounded-bl-xl">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            )}

                            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <Award className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{test.description}</p>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{test.durationMinutes} {t('minutes')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-primary-600">{test.questions?.length || 15}</span>
                                    <span>{t('questions')}</span>
                                </div>
                            </div>

                            {isVerified ? (
                                <button disabled className="w-full py-2 bg-green-50 text-green-700 rounded-lg font-semibold cursor-default">
                                    {t('verified')}
                                </button>
                            ) : (
                                <Link
                                    href={`/freelancer/skills/${test._id}`}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {t('startTest')}
                                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {tests.length === 0 && (
                <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('noTests')}</h3>
                    <p className="text-gray-500">{t('checkBackLater')}</p>
                </div>
            )}
        </div>
    );
}
