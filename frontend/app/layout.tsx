import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
    title: 'منصة التوظيف | JobBoard',
    description: 'منصة توظيف شاملة للشركات والباحثين عن عمل',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className="min-h-screen bg-gray-50 flex flex-col">
                <AuthProvider>
                    <Header />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#333',
                                color: '#fff',
                                borderRadius: '12px',
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
