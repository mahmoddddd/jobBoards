'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (user && token) {
            // Determine socket URL - prefer localhost if running locally
            const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
            const socketUrl = isLocal
                ? 'http://localhost:5000'
                : (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');

            console.log('🔌 Connecting to socket:', socketUrl);

            const newSocket = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling'], // force websocket first for better performance
                query: { token: token }
            });

            newSocket.on('connect', () => {
                console.log('🔌 Socket connected:', newSocket.id);
                newSocket.emit('join', user.id);
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
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
