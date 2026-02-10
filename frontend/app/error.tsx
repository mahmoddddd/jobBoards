'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    حدث خطأ غير متوقع
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="btn-primary flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        إعادة المحاولة
                    </button>
                    <Link href="/" className="btn-secondary flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        الرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}
