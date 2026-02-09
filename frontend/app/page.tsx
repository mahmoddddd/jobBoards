import Link from 'next/link';
import {
    Briefcase,
    Building2,
    Users,
    Search,
    ArrowLeft,
    CheckCircle,
    Zap,
    Shield
} from 'lucide-react';

export default function Home() {
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
                            <span className="text-sm">أكثر من 1000+ وظيفة متاحة</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
                            اعثر على وظيفة
                            <span className="block text-secondary-400">أحلامك اليوم</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
                            منصة التوظيف الأولى التي تربط بين الشركات الرائدة والمواهب المميزة.
                            ابدأ رحلتك المهنية الآن.
                        </p>

                        {/* Search Box */}
                        <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="ابحث عن وظيفة..."
                                        className="w-full pr-12 pl-4 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <Link href="/jobs" className="btn-primary whitespace-nowrap">
                                    ابحث الآن
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                </Link>
                            </div>
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
                            <div className="text-gray-600">وظيفة متاحة</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                            <div className="text-gray-600">شركة مسجلة</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
                            <div className="text-gray-600">مستخدم نشط</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
                            <div className="text-gray-600">نسبة الرضا</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا JobBoard؟</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            نقدم لك أفضل تجربة توظيف مع ميزات متقدمة تساعدك في العثور على الوظيفة المثالية
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card p-8 text-center card-hover">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <Search className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">بحث متقدم</h3>
                            <p className="text-gray-600">
                                فلترة دقيقة حسب الموقع ونوع العمل والخبرة المطلوبة
                            </p>
                        </div>

                        <div className="card p-8 text-center card-hover">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-secondary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">تقديم سهل</h3>
                            <p className="text-gray-600">
                                قدم على الوظائف بضغطة زر مع رفع السيرة الذاتية
                            </p>
                        </div>

                        <div className="card p-8 text-center card-hover">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                <Shield className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">شركات موثوقة</h3>
                            <p className="text-gray-600">
                                جميع الشركات تمر بمراجعة دقيقة قبل الموافقة
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            هل أنت شركة تبحث عن مواهب؟
                        </h2>
                        <p className="text-gray-300 text-lg mb-8">
                            انضم إلى منصتنا واعثر على أفضل الكفاءات لشركتك
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register?type=company" className="btn-primary">
                                <Building2 className="w-5 h-5 ml-2" />
                                سجل كشركة
                            </Link>
                            <Link href="/jobs" className="btn bg-white text-gray-900 hover:bg-gray-100">
                                <Briefcase className="w-5 h-5 ml-2" />
                                تصفح الوظائف
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">JobBoard</span>
                        </div>
                        <div className="flex gap-6">
                            <Link href="/jobs" className="hover:text-white transition-colors">الوظائف</Link>
                            <Link href="/companies" className="hover:text-white transition-colors">الشركات</Link>
                            <Link href="/about" className="hover:text-white transition-colors">من نحن</Link>
                            <Link href="/contact" className="hover:text-white transition-colors">اتصل بنا</Link>
                        </div>
                        <div className="text-sm">
                            © 2024 JobBoard. جميع الحقوق محفوظة.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
