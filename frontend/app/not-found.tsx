import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center max-w-md">
                <div className="text-8xl font-bold text-primary-600 mb-4">404</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    الصفحة غير موجودة
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link href="/" className="btn-primary flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        الرئيسية
                    </Link>
                    <Link href="/jobs" className="btn-secondary flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        تصفح الوظائف
                    </Link>
                </div>
            </div>
        </div>
    );
}
