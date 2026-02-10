'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
    Briefcase,
    Menu,
    X,
    User,
    LogOut,
    Settings,
    Building2,
    LayoutDashboard,
    Bookmark,
    ChevronDown,
    Sun,
    Moon
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Header() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
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

    const textColorClass = 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400';
    const activeColorClass = 'text-primary-600 font-semibold dark:text-primary-400';

    const logoTextClass = 'text-gray-900 dark:text-white';
    const logoBrandClass = 'text-primary-600 dark:text-primary-400';

    return (
        <header className="fixed w-full top-0 z-50 py-4 px-4 transition-all duration-300 pointer-events-none">
            <div className={`container max-w-5xl mx-auto px-6 rounded-2xl transition-all duration-300 pointer-events-auto ${scrolled
                ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg py-2'
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-3'
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
                    <div className="hidden md:flex items-center gap-3">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-110"
                            aria-label="Toggle dark mode"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <NotificationBell />

                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-gray-100 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-white dark:ring-gray-700 group-hover:scale-105 transition-transform">
                                            {user.name[0].toUpperCase()}
                                        </div>
                                        <div className="hidden lg:block text-right">
                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center gap-1">
                                                {user.name}
                                                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                                {user.role === 'ADMIN' ? 'مدير النظام' : user.role === 'COMPANY' ? 'حساب شركة' : 'باحث عن عمل'}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {dropdownOpen && (
                                        <div className="absolute top-14 left-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
                                            <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                                <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                {user.role === 'ADMIN' && (
                                                    <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                                                        <LayoutDashboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                        <span>لوحة الإدارة</span>
                                                    </Link>
                                                )}
                                                {user.role === 'COMPANY' && (
                                                    <>
                                                        <Link href="/company/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                                                            <LayoutDashboard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                            <span>لوحة تحكم الشركة</span>
                                                        </Link>
                                                        <Link href="/company/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                                                            <Building2 className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                                                            <span>ملف الشركة</span>
                                                        </Link>
                                                    </>
                                                )}
                                                {user.role === 'USER' && (
                                                    <>
                                                        <Link href="/applications" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                                                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            <span>طلباتي</span>
                                                        </Link>
                                                        <Link href="/saved-jobs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                                                            <Bookmark className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                            <span>الوظائف المحفوظة</span>
                                                        </Link>
                                                        <Link href="/resume-builder" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                                                            <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            <span>بناء السيرة الذاتية</span>
                                                        </Link>
                                                    </>
                                                )}
                                                <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                                                    <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                    <span>إعدادات الحساب</span>
                                                </Link>
                                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                                                <button
                                                    onClick={logout}
                                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 w-full transition-colors"
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
                                <Link href="/login" className="px-5 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                    دخول
                                </Link>
                                <Link href="/register" className="px-5 py-2.5 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all transform hover:-translate-y-0.5">
                                    حساب جديد
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-fade-in pointer-events-auto">
                    <div className="p-4 space-y-2">
                        <Link href="/jobs" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300">الوظائف</Link>
                        <Link href="/companies" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300">الشركات</Link>
                        <Link href="/about" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300">عن المنصة</Link>

                        {user ? (
                            <div className="border-t dark:border-gray-700 pt-4">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                </div>

                                {user.role === 'ADMIN' && (
                                    <Link href="/admin/dashboard" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">لوحة الإدارة</Link>
                                )}
                                {user.role === 'COMPANY' && (
                                    <Link href="/company/dashboard" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">لوحة الشركة</Link>
                                )}
                                {user.role === 'USER' && (
                                    <>
                                        <Link href="/applications" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">طلباتي</Link>
                                        <Link href="/saved-jobs" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">الوظائف المحفوظة</Link>
                                        <Link href="/resume-builder" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">السيرة الذاتية</Link>
                                    </>
                                )}
                                <Link href="/profile" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">الإعدادات</Link>
                                <button
                                    onClick={logout}
                                    className="w-full text-right p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                >
                                    تسجيل الخروج
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 border-t dark:border-gray-700 pt-4">
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
