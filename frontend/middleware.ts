import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/profile', '/applications', '/saved-jobs'];
const companyRoutes = ['/company'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;
    const userCookie = request.cookies.get('user')?.value;

    let user: { role?: string } | null = null;
    try {
        if (userCookie) {
            user = JSON.parse(userCookie);
        }
    } catch (e) {
        // Invalid cookie
    }

    // Redirect authenticated users away from auth pages
    if (authRoutes.some(route => pathname.startsWith(route)) && token && user) {
        if (user.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else if (user.role === 'COMPANY') {
            return NextResponse.redirect(new URL('/company/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/jobs', request.url));
    }

    // Check protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Check company routes
    if (companyRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (user && user.role !== 'COMPANY' && user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (user && user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/profile/:path*',
        '/applications/:path*',
        '/saved-jobs/:path*',
        '/company/:path*',
        '/admin/:path*',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
    ],
};
