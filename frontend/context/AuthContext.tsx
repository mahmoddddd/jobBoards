'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'COMPANY' | 'ADMIN';
    companyId?: string;
    phone?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedToken = Cookies.get('token');
        const savedUser = Cookies.get('user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                Cookies.remove('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authAPI.login({ email, password });
        const { token: newToken, user: newUser } = response.data;

        setToken(newToken);
        setUser(newUser);

        Cookies.set('token', newToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(newUser), { expires: 7 });

        // Redirect based on role
        if (newUser.role === 'ADMIN') {
            router.push('/admin/dashboard');
        } else if (newUser.role === 'COMPANY') {
            router.push('/company/dashboard');
        } else {
            router.push('/jobs');
        }
    };

    const register = async (data: any) => {
        const response = await authAPI.register(data);
        const { token: newToken, user: newUser } = response.data;

        setToken(newToken);
        setUser(newUser);

        Cookies.set('token', newToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(newUser), { expires: 7 });

        if (newUser.role === 'COMPANY') {
            router.push('/company/dashboard');
        } else {
            router.push('/jobs');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        Cookies.remove('token');
        Cookies.remove('user');
        router.push('/');
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
