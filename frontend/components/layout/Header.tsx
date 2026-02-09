'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Briefcase,
    Menu,
    X,
    User,
    LogOut,
    Settings,
    Building2,
    LayoutDashboard,
    Bookmark
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Header() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsOpen(false);
        setDropdownOpen(false);
    }, [pathname]);

    const isActive = (path: string) => pathname === path;

    const isHomePage = pathname === '/';

    // Simplified color logic - always dark text like /about page
    // - Before scroll: dark text on transparent background
    // - After scroll: dark text on white background
    const textColorClass = 'text-gray-700 hover:text-primary-600';
    const activeColorClass = 'text-primary-600 font-semibold';

    // Logo text color - always dark
    const logoTextClass = 'text-gray-900';
    const logoBrandClass = 'text-primary-600';

    return (
        <header className="fixed w-full top-0 z-50 py-4 px-4 transition-all duration-300 pointer-events-none">
            <div className={`container max-w-5xl mx-auto px-6 rounded-2xl transition-all duration-300 pointer-events-auto ${scrolled
                ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
                : 'bg-white/80 backdrop-blur-sm py-3'
                }`}>
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary-600 p-2 rounded-xl text-white transform group-hover:scale-110 transition-transform">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <span className={`text-xl font-bold ${logoTextClass}`}>
                            Job<span className={logoBrandClass}>Board</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/jobs"
                            className={`font-medium transition-colors ${isActive('/jobs') ? activeColorClass : textColorClass}`}
                        >
                            الوظائف
                        </Link>
                        <Link
                            href="/companies"
                            className={`font-medium transition-colors ${isActive('/companies') ? activeColorClass : textColorClass}`}
                        >
                            الشركات
                        </Link>
                        <Link
                            href="/about"
                            className={`font-medium transition-colors ${isActive('/about') ? activeColorClass : textColorClass}`}
                        >
                            عن المنصة
                        </Link>
                    </nav>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <NotificationBell />

                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 hover:bg-white hover:shadow-md transition-all bg-white/50 backdrop-blur-sm"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold shadow-sm">
                                            {user.name[0].toUpperCase()}
                                        </div>
                                        <div className="text-right hidden lg:block">
                                            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                                                {user.role === 'ADMIN' && <span className="text-purple-600">مسؤول</span>}
                                                {user.role === 'COMPANY' && <span className="text-blue-600">شركة</span>}
                                                {user.role === 'USER' && <span className="text-gray-600">باحث</span>}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {dropdownOpen && (
                                        <div className="absolute top-14 left-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                                            <div className="p-4 border-b bg-gray-50">
                                                <p className="font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                {user.role === 'ADMIN' && (
                                                    <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                                                        <LayoutDashboard className="w-4 h-4 text-purple-600" />
                                                        <span>لوحة الإدارة</span>
                                                    </Link>
                                                )}
                                                {user.role === 'COMPANY' && (
                                                    <>
                                                        <Link href="/company/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                                                            <LayoutDashboard className="w-4 h-4 text-primary-600" />
                                                            <span>لوحة تحكم الشركة</span>
                                                        </Link>
                                                        <Link href="/company/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                                                            <Building2 className="w-4 h-4 text-secondary-600" />
                                                            <span>ملف الشركة</span>
                                                        </Link>
                                                    </>
                                                )}
                                                {user.role === 'USER' && (
                                                    <Link href="/saved-jobs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                                                        <Bookmark className="w-4 h-4 text-yellow-600" />
                                                        <span>الوظائف المحفوظة</span>
                                                    </Link>
                                                )}
                                                <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                                                    <Settings className="w-4 h-4 text-gray-600" />
                                                    <span>إعدادات الحساب</span>
                                                </Link>
                                                <div className="h-px bg-gray-100 my-1" />
                                                <button
                                                    onClick={logout}
                                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 w-full transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>تسجيل الخروج</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-all">
                                    دخول
                                </Link>
                                <Link href="/register" className="px-5 py-2.5 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all transform hover:-translate-y-0.5">
                                    حساب جديد
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b shadow-lg animate-fade-in">
                    <div className="p-4 space-y-4">
                        <Link href="/jobs" className="block p-3 rounded-lg hover:bg-gray-50 font-medium">الوظائف</Link>
                        <Link href="/companies" className="block p-3 rounded-lg hover:bg-gray-50 font-medium">الشركات</Link>

                        {user ? (
                            <div className="border-t pt-4">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                </div>

                                {user.role === 'ADMIN' && (
                                    <Link href="/admin/dashboard" className="block p-3 rounded-lg hover:bg-gray-50">لوحة الإدارة</Link>
                                )}
                                {user.role === 'COMPANY' && (
                                    <Link href="/company/dashboard" className="block p-3 rounded-lg hover:bg-gray-50">لوحة الشركة</Link>
                                )}
                                <Link href="/profile" className="block p-3 rounded-lg hover:bg-gray-50">الإعدادات</Link>
                                <button
                                    onClick={logout}
                                    className="w-full text-right p-3 rounded-lg hover:bg-red-50 text-red-600"
                                >
                                    تسجيل الخروج
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <Link href="/login" className="btn-secondary text-center">دخول</Link>
                                <Link href="/register" className="btn-primary text-center">حساب جديد</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
