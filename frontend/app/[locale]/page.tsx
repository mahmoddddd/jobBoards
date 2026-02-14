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
    CheckCircle,
    ShieldCheck,
    Headphones,
    Code,
    Paintbrush,
    Megaphone,
    Globe,
    PenTool,
    BarChart,
    Database,
    Music,
    Monitor,
    Rocket
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
            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm">{t('features.title')}</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">{t('features.title')}</h2>
                        <div className="w-20 h-1 bg-primary-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('features.secure')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('features.secureDesc')}</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700">
                            <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('features.verified')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('features.verifiedDesc')}</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700">
                            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Headphones className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('features.support')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('features.supportDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('categories.title')}</h2>
                            <div className="w-20 h-1 bg-primary-600 mt-4 rounded-full"></div>
                        </div>
                        <Link href="/jobs" className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors">
                            {t('browseJobs')} <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Code, label: 'Development', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                            { icon: Paintbrush, label: 'Design', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
                            { icon: Megaphone, label: 'Marketing', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                            { icon: Globe, label: 'Translation', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                            { icon: PenTool, label: 'Writing', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                            { icon: BarChart, label: 'Business', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                            { icon: Database, label: 'Data', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                            { icon: Monitor, label: 'IT Support', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                        ].map((cat, i) => (
                            <Link key={i} href={`/jobs?category=${cat.label}`}
                                className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group">
                                <div className={`w-12 h-12 rounded-full ${cat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{cat.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('howItWorks.title')}</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Simple steps to get started</p>
                    </div>

                    <div className="relative grid md:grid-cols-3 gap-8">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>

                        {[
                            { step: 1, title: 'step1', desc: 'step1Desc', icon: UserCheck },
                            { step: 2, title: 'step2', desc: 'step2Desc', icon: Search },
                            { step: 3, title: 'step3', desc: 'step3Desc', icon: Rocket },
                        ].map((item, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border-4 border-primary-50 dark:border-gray-700 flex items-center justify-center mb-6 shadow-lg z-10">
                                    <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t(`howItWorks.${item.title}`)}</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-xs">{t(`howItWorks.${item.desc}`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="relative rounded-3xl overflow-hidden bg-primary-600 text-white p-12 md:p-20 text-center">
                        {/* Background Patterns */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/grid.svg')]"></div>
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary-500/30 rounded-full blur-3xl"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('cta.title')}</h2>
                            <p className="text-xl opacity-90 mb-10 leading-relaxed">{t('cta.subtitle')}</p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register?type=freelancer" className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                                    {t('cta.freelancerBtn')}
                                </Link>
                                <Link href="/register?type=company" className="px-8 py-4 bg-primary-700/50 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-primary-700 hover:shadow-lg hover:-translate-y-1 transition-all">
                                    {t('cta.companyBtn')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
