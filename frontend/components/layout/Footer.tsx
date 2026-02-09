import Link from 'next/link';
import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">JobBoard</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            منصة التوظيف الرائدة في المنطقة. نربط الباحثين عن عمل بأفضل الفرص الوظيفية.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">روابط سريعة</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/jobs" className="text-gray-400 hover:text-primary-400 transition">
                                    تصفح الوظائف
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-gray-400 hover:text-primary-400 transition">
                                    إنشاء حساب
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-gray-400 hover:text-primary-400 transition">
                                    تسجيل الدخول
                                </Link>
                            </li>
                            <li>
                                <Link href="/register?type=company" className="text-gray-400 hover:text-primary-400 transition">
                                    للشركات
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Companies */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">للشركات</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/register?type=company" className="text-gray-400 hover:text-primary-400 transition">
                                    نشر وظيفة
                                </Link>
                            </li>
                            <li>
                                <Link href="/company/dashboard" className="text-gray-400 hover:text-primary-400 transition">
                                    لوحة التحكم
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                                    باقات الأسعار
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                                    الدعم الفني
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">تواصل معنا</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-400">
                                <MapPin className="w-5 h-5 text-primary-400" />
                                <span>القاهرة، مصر</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Phone className="w-5 h-5 text-primary-400" />
                                <span dir="ltr">+20 100 123 4567</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail className="w-5 h-5 text-primary-400" />
                                <span>support@jobboard.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} JobBoard. جميع الحقوق محفوظة.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                            سياسة الخصوصية
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                            شروط الاستخدام
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                            الأسئلة الشائعة
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
