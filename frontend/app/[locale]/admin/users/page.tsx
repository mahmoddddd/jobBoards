'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Users,
    Search,
    Filter,
    Shield,
    Building2,
    User,
    Ban,
    CheckCircle,
    Loader2,
    ArrowRight,
    Mail,
    Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    companyId?: {
        name: string;
    };
}

export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'ADMIN') {
                router.push('/');
            } else {
                fetchUsers();
            }
        }
    }, [user, authLoading, router]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId: string, isActive: boolean) => {
        try {
            await api.put(`/admin/users/${userId}`, { isActive: !isActive });
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, isActive: !isActive } : u
            ));
            toast.success(isActive ? 'تم إيقاف الحساب' : 'تم تفعيل الحساب');
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await api.put(`/admin/users/${userId}`, { role: newRole });
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, role: newRole } : u
            ));
            toast.success('تم تغيير الصلاحية');
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = !roleFilter || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <span className="badge badge-red">مدير</span>;
            case 'COMPANY':
                return <span className="badge badge-blue">شركة</span>;
            default:
                return <span className="badge badge-green">مستخدم</span>;
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Shield className="w-5 h-5 text-red-500" />;
            case 'COMPANY':
                return <Building2 className="w-5 h-5 text-blue-500" />;
            default:
                return <User className="w-5 h-5 text-green-500" />;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    const usersCount = users.filter(u => u.role === 'USER').length;
    const companiesCount = users.filter(u => u.role === 'COMPANY').length;
    const adminsCount = users.filter(u => u.role === 'ADMIN').length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin/dashboard" className="text-primary-600 hover:underline flex items-center gap-1 mb-4">
                        <ArrowRight className="w-4 h-4" />
                        العودة للوحة الإدارة
                    </Link>
                    <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
                    <p className="text-gray-600 mt-1">{users.length} مستخدم مسجل</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{users.length}</p>
                                <p className="text-gray-500 text-sm">إجمالي</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{usersCount}</p>
                                <p className="text-gray-500 text-sm">باحثين</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{companiesCount}</p>
                                <p className="text-gray-500 text-sm">شركات</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{adminsCount}</p>
                                <p className="text-gray-500 text-sm">مدراء</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="بحث بالاسم أو الإيميل..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pr-12 w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="input"
                            >
                                <option value="">كل الأدوار</option>
                                <option value="USER">باحثين عن عمل</option>
                                <option value="COMPANY">شركات</option>
                                <option value="ADMIN">مدراء</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">المستخدم</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">البريد</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الدور</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الحالة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">تاريخ التسجيل</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredUsers.map((userData) => (
                                    <tr key={userData._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                                                    {userData.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{userData.name}</p>
                                                    {userData.companyId && (
                                                        <p className="text-sm text-gray-500">{userData.companyId.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                {userData.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getRoleIcon(userData.role)}
                                                {getRoleBadge(userData.role)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {userData.isActive ? (
                                                <span className="badge badge-green">نشط</span>
                                            ) : (
                                                <span className="badge badge-red">موقوف</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(userData.createdAt).toLocaleDateString('ar-EG')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {userData.role !== 'ADMIN' && (
                                                    <>
                                                        {userData.isActive ? (
                                                            <button
                                                                onClick={() => handleToggleActive(userData._id, userData.isActive)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                                title="إيقاف الحساب"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleToggleActive(userData._id, userData.isActive)}
                                                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                                                                title="تفعيل الحساب"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">لا يوجد مستخدمين</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
