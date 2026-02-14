import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const publicPages = ['/login', '/register', '/forgot-password', '/reset-password', '/jobs', '/projects', '/freelancers', '/companies', '/about', '/', '/privacy'];

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedRoutes = ['/profile', '/applications', '/saved-jobs', '/contracts', '/messages', '/freelancer'];
const companyRoutes = ['/company'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Exclude API and internal paths
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // 1. Run intl middleware first
    const response = intlMiddleware(req);

    // 2. Auth Logic
    const token = req.cookies.get('token')?.value;
    const userCookie = req.cookies.get('user')?.value;
    let user: { role?: string } | null = null;

    try {
        if (userCookie) {
            user = JSON.parse(userCookie);
        }
    } catch (e) {
        // Invalid cookie
    }

    // Extract locale and path logic
    const pathnameHasLocale = routing.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (!pathnameHasLocale) {
        // Let intlMiddleware handle redirect to default locale
        return response;
    }

    // Parse the path to get locale and clean path
    // e.g. /ar/admin -> locale: ar, cleanPath: /admin
    const segments = pathname.split('/');
    const locale = segments[1]; // 'ar' or 'en'
    const cleanPath = '/' + segments.slice(2).join('/') || '/'; // Handle root /ar -> /

    // --- Access Control Checks ---

    // Admin Routes
    if (cleanPath.startsWith('/admin')) {
        if (!token) {
            const url = new URL(`/${locale}/login`, req.url);
            url.searchParams.set('redirect', cleanPath);
            return NextResponse.redirect(url);
        }
        if (user && user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL(`/${locale}/`, req.url));
        }
    }

    // Company Routes
    if (cleanPath.startsWith('/company')) {
        if (!token) {
            const url = new URL(`/${locale}/login`, req.url);
            url.searchParams.set('redirect', cleanPath);
            return NextResponse.redirect(url);
        }
        if (user && user.role !== 'COMPANY' && user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL(`/${locale}/`, req.url));
        }
    }

    // Protected General Routes
    const isProtected = protectedRoutes.some(route => cleanPath.startsWith(route));
    if (isProtected) {
        if (!token) {
            const url = new URL(`/${locale}/login`, req.url);
            url.searchParams.set('redirect', cleanPath);
            return NextResponse.redirect(url);
        }
    }

    // Redirect Logged-in Users from Auth Pages
    const isAuthPage = authRoutes.some(route => cleanPath === route || cleanPath.startsWith(route + '/'));
    if (isAuthPage && token && user) {
        if (user.role === 'ADMIN') {
            return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, req.url));
        } else if (user.role === 'COMPANY') {
            return NextResponse.redirect(new URL(`/${locale}/company/dashboard`, req.url));
        }
        return NextResponse.redirect(new URL(`/${locale}/jobs`, req.url));
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
