import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SocketProvider } from '@/context/SocketContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '../globals.css';

export const metadata: Metadata = {
    title: 'JobBoard | Professional Employment Platform',
    description: 'Comprehensive employment platform for companies and job seekers',
};

export default async function RootLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={direction} suppressHydrationWarning>
            <body className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <AuthProvider>
                        <ThemeProvider>
                            <SocketProvider>
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
                            </SocketProvider>
                        </ThemeProvider>
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
