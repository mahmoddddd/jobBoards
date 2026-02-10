'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

let socket: Socket | null = null;

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            // Connect to socket server
            socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
                withCredentials: true,
            });

            socket.on('connect', () => {
                console.log('🔌 Socket connected');
                socket?.emit('join', user.id);
            });

            socket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
            });

            return () => {
                socket?.disconnect();
                socket = null;
            };
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
