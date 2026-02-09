import { Briefcase, Building2, Users } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-32 pb-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-extrabold sm:text-5xl mb-4">
                        عن <span className="text-primary-200">JobBoard</span>
                    </h1>
                    <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                        منصتك الأولى للبحث عن الوظائف في مصر والوطن العربي. نربط أفضل الكفاءات بأفضل الشركات.
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
                            <h3 className="text-xl font-bold text-gray-900 mb-2">فرص وظيفية متنوعة</h3>
                            <p className="text-gray-600">
                                آلاف الوظائف في مختلف المجالات، من البرمجة والتسويق إلى الهندسة والإدارة.
                            </p>
                        </div>

                        <div className="card p-6 text-center hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">شركات مرموقة</h3>
                            <p className="text-gray-600">
                                تعاون مستمر مع كبرى الشركات والشركات الناشئة لتقديم أفضل بيئة عمل للموظفين.
                            </p>
                        </div>

                        <div className="card p-6 text-center hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">سهولة التقديم</h3>
                            <p className="text-gray-600">
                                واجهة مستخدم بسيطة وسلسة تمكنك من إنشاء سيرتك الذاتية والتقديم بضغطة زر.
                            </p>
                        </div>
                    </div>

                    {/* Mission Section */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">رؤيتنا ورسالتنا</h2>
                        <div className="space-y-4 text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                            <p>
                                نسعى في <span className="font-semibold text-primary-600">JobBoard</span> لتقليص الفجوة بين الباحثين عن عمل والشركات.
                                نؤمن بأن كل شخص يستحق فرصة عمل تناسب مهاراته وطموحاته، وأن كل شركة تستحق أن تجد الموظف المثالي الذي يساهم في نموها.
                            </p>
                            <p>
                                نعمل باستمرار على تطوير أدواتنا وتقنياتنا لتسهيل عملية التوظيف وجعلها أكثر كفاءة وشفافية للجميع.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
