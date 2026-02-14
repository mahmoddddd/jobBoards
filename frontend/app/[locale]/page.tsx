import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import {
    Briefcase,
    Building2,
    Users,
    Search,
    ArrowLeft,
    Zap,
    Shield,
    MessageCircle,
    FolderOpen,
    UserCheck,
    CheckCircle
} from 'lucide-react';

export default async function Home() {
    const t = await getTranslations('HomePage');

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-secondary-400/30 to-transparent rounded-full blur-3xl"></div>

                <div className="container mx-auto px-4 pt-32 pb-24 md:pt-40 md:pb-32 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm">JobBoard Platform</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
                            {t('title')}
                        </h1>

                        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>

                        {/* Search Box */}
                        <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 left-4 rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto" />
                                    <input
                                        type="text"
                                        placeholder={t('searchPlaceholder')}
                                        className="w-full py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 pl-12 pr-4 rtl:pr-12 rtl:pl-4 ltr:pl-12 ltr:pr-4"
                                    />
                                </div>
                                <Link href="/jobs" className="btn-primary whitespace-nowrap flex items-center justify-center">
                                    {t('searchButton')}
                                    <ArrowLeft className="w-5 h-5 ml-2 rtl:rotate-180 ltr:ml-2" />
                                </Link>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-wrap justify-center gap-3 mt-8">
                            <Link href="/jobs" className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-sm transition-all">
                                🏢 {t('browseJobs')}
                            </Link>
                            <Link href="/projects" className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-sm transition-all">
                                📋 {t('browseProjects')}
                            </Link>
                            <Link href="/freelancers" className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-sm transition-all">
                                👨‍💻 {t('browseFreelancers')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb" />
                    </svg>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">1500+</div>
                            <div className="text-gray-600">{t('stats.jobs')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                            <div className="text-gray-600">{t('stats.projects')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">2K+</div>
                            <div className="text-gray-600">{t('stats.freelancers')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
                            <div className="text-gray-600">{t('stats.satisfaction')}</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
