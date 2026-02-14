import { getTranslations } from 'next-intl/server';
import { Briefcase, Building2, Users } from 'lucide-react';

export default async function AboutPage() {
    const t = await getTranslations('About');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-32 pb-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-extrabold sm:text-5xl mb-4">
                        {t('title')} <span className="text-primary-200">JobBoard</span>
                    </h1>
                    <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card p-6 text-center hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('diverseOpportunities')}</h3>
                            <p className="text-gray-600">
                                {t('diverseDesc')}
                            </p>
                        </div>

                        <div className="card p-6 text-center hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('reputableCompanies')}</h3>
                            <p className="text-gray-600">
                                {t('reputableDesc')}
                            </p>
                        </div>

                        <div className="card p-6 text-center hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('easyApply')}</h3>
                            <p className="text-gray-600">
                                {t('easyApplyDesc')}
                            </p>
                        </div>
                    </div>

                    {/* Mission Section */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('visionTitle')}</h2>
                        <div className="space-y-4 text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                            <p>
                                {t('visionP1')}
                            </p>
                            <p>
                                {t('visionP2')}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
